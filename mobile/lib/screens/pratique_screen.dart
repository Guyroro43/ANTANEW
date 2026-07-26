import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:speech_to_text/speech_to_text.dart';
import 'package:flutter_tts/flutter_tts.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../config/api_config.dart';
import '../config/app_theme.dart';
import '../data/personas.dart';

class _ChatMessage {
  final String role; // 'user' | 'model'
  final String text;

  _ChatMessage({required this.role, required this.text});
}

class _SpeechSegment {
  final String text;
  final bool isFrench;

  _SpeechSegment({required this.text, required this.isFrench});
}

const _personaStorageKey = 'anta_pratique_persona';

List<_SpeechSegment> _splitIntoSpeechSegments(String text) {
  return text
      .split('\n')
      .map((line) {
        final isFrench = line.trim().startsWith('💡');
        final cleaned = line
            .replaceAll('💡', '')
            .replaceAll(RegExp(r'[*_#`~]'), '')
            .replaceAll(RegExp(r'\s+'), ' ')
            .trim();
        return _SpeechSegment(text: cleaned, isFrench: isFrench);
      })
      .where((segment) => segment.text.isNotEmpty)
      .toList();
}

class PratiqueScreen extends StatefulWidget {
  const PratiqueScreen({super.key});

  @override
  State<PratiqueScreen> createState() => _PratiqueScreenState();
}

class _PratiqueScreenState extends State<PratiqueScreen> {
  final _controller = TextEditingController();
  final _scrollController = ScrollController();
  final List<_ChatMessage> _messages = [];
  final SpeechToText _speech = SpeechToText();
  final FlutterTts _tts = FlutterTts();

  bool _isSending = false;
  bool _isRecording = false;
  bool _speechAvailable = false;
  String? _error;
  String _mode = 'text'; // 'text' | 'voice'
  String _personaId = 'kora';
  bool _showPersonaPicker = false;
  String _avatarState = 'idle'; // idle | listening | thinking | speaking

  @override
  void initState() {
    super.initState();
    final firstName = Supabase.instance.client.auth.currentUser?.userMetadata?['first_name'] as String? ?? 'Apprenant';
    _messages.add(
      _ChatMessage(
        role: 'model',
        text: "Hi $firstName! 👋 I'm Kora, your English practice partner. Tell me about your day, or ask me anything — let's chat!",
      ),
    );
    _tts.awaitSpeakCompletion(true);
    _initSpeech();
    _loadPersona();
  }

  Future<void> _loadPersona() async {
    final prefs = await SharedPreferences.getInstance();
    final stored = prefs.getString(_personaStorageKey);
    if (stored != null && mounted) setState(() => _personaId = stored);
  }

  Future<void> _choosePersona(String id) async {
    setState(() {
      _personaId = id;
      _showPersonaPicker = false;
    });
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_personaStorageKey, id);
  }

  Future<void> _initSpeech() async {
    final available = await _speech.initialize(
      onStatus: (status) {
        if (status == 'done' || status == 'notListening') {
          if (mounted) setState(() => _isRecording = false);
        }
      },
      onError: (_) {
        if (mounted) {
          setState(() {
            _isRecording = false;
            if (_avatarState == 'listening') _avatarState = 'idle';
          });
        }
      },
    );
    if (mounted) setState(() => _speechAvailable = available);
  }

  @override
  void dispose() {
    _controller.dispose();
    _scrollController.dispose();
    _speech.stop();
    _tts.stop();
    super.dispose();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!_scrollController.hasClients) return;
      _scrollController.animateTo(
        _scrollController.position.maxScrollExtent,
        duration: const Duration(milliseconds: 250),
        curve: Curves.easeOut,
      );
    });
  }

  Future<void> _playSpeech(String text) async {
    final segments = _splitIntoSpeechSegments(text);
    if (segments.isEmpty) return;

    setState(() => _avatarState = 'speaking');
    final persona = getPersona(_personaId);
    final isMale = persona.gender == 'male';

    for (final segment in segments) {
      await _tts.setLanguage(segment.isFrench ? 'fr-FR' : 'en-US');
      await _tts.setPitch(isMale ? 0.85 : 1.15);
      await _tts.setSpeechRate(0.48);
      try {
        await _tts.speak(segment.text);
      } catch (_) {
        // Bonus audio : on continue même si un segment échoue.
      }
    }
    if (mounted) setState(() => _avatarState = 'idle');
  }

  Future<void> _sendMessage(String text, {required bool speak}) async {
    final trimmed = text.trim();
    if (trimmed.isEmpty || _isSending) return;

    final history = _messages.map((m) => {'role': m.role, 'text': m.text}).toList();

    setState(() {
      _messages.add(_ChatMessage(role: 'user', text: trimmed));
      _controller.clear();
      _isSending = true;
      _error = null;
      if (speak) _avatarState = 'thinking';
    });
    _scrollToBottom();

    final token = Supabase.instance.client.auth.currentSession?.accessToken;

    try {
      final response = await http
          .post(
            Uri.parse('${ApiConfig.baseUrl}/api/pratique/chat'),
            headers: {
              'Content-Type': 'application/json',
              if (token != null) 'Authorization': 'Bearer $token',
            },
            body: jsonEncode({'message': trimmed, 'history': history}),
          )
          .timeout(const Duration(seconds: 30));

      final data = jsonDecode(response.body) as Map<String, dynamic>;
      if (response.statusCode != 200) {
        throw Exception(data['error'] ?? 'Échec de la réponse IA.');
      }

      final reply = data['reply'] as String;
      setState(() => _messages.add(_ChatMessage(role: 'model', text: reply)));
      if (speak) await _playSpeech(reply);
    } catch (e) {
      setState(() {
        _error = 'Échec de la réponse IA.';
        _avatarState = 'idle';
      });
    } finally {
      if (mounted) setState(() => _isSending = false);
      _scrollToBottom();
    }
  }

  Future<void> _startListening(void Function(String transcript) onFinal) async {
    if (!_speechAvailable) return;
    setState(() {
      _isRecording = true;
      _avatarState = 'listening';
    });
    await _speech.listen(
      onResult: (result) {
        if (result.finalResult) {
          setState(() => _isRecording = false);
          if (result.recognizedWords.trim().isNotEmpty) onFinal(result.recognizedWords);
        }
      },
      listenOptions: SpeechListenOptions(localeId: 'en_US'),
    );
  }

  void _stopListening() {
    _speech.stop();
    setState(() {
      _isRecording = false;
      if (_avatarState == 'listening') _avatarState = 'idle';
    });
  }

  void _handleVoiceMicTap() {
    if (_isRecording) {
      _stopListening();
      return;
    }
    _startListening((transcript) {
      setState(() => _avatarState = 'idle');
      _sendMessage(transcript, speak: true);
    });
  }

  void _handleTextMicTap() {
    if (_isRecording) {
      _stopListening();
      return;
    }
    _startListening((transcript) {
      setState(() {
        _avatarState = 'idle';
        _controller.text = _controller.text.isEmpty ? transcript : '${_controller.text} $transcript';
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    final persona = getPersona(_personaId);

    return Column(
      children: [
        _buildHeader(persona),
        Expanded(
          child: _mode == 'text' ? _buildTextMode(persona) : _buildVoiceMode(persona),
        ),
      ],
    );
  }

  Widget _buildHeader(Persona persona) {
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
      decoration: const BoxDecoration(
        gradient: LinearGradient(colors: [AntaColors.red, AntaColors.yellow]),
      ),
      child: Column(
        children: [
          Row(
            children: [
              GestureDetector(
                onTap: () => setState(() => _showPersonaPicker = !_showPersonaPicker),
                child: CircleAvatar(
                  radius: 20,
                  backgroundImage: AssetImage(persona.avatarAsset),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(persona.name, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800)),
                    const Text(
                      'Entraînement libre, pas une évaluation',
                      style: TextStyle(color: Colors.white70, fontSize: 11),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
              IconButton(
                onPressed: () => setState(() => _mode = _mode == 'text' ? 'voice' : 'text'),
                icon: Icon(_mode == 'text' ? Icons.mic : Icons.chat_bubble_outline, color: Colors.white),
              ),
            ],
          ),
          if (_showPersonaPicker)
            Padding(
              padding: const EdgeInsets.only(top: 10),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: personas.map((p) {
                  final selected = p.id == _personaId;
                  return GestureDetector(
                    onTap: () => _choosePersona(p.id),
                    child: Column(
                      children: [
                        CircleAvatar(
                          radius: 22,
                          backgroundColor: selected ? Colors.white : Colors.white.withValues(alpha: 0.4),
                          child: CircleAvatar(radius: 20, backgroundImage: AssetImage(p.avatarAsset)),
                        ),
                        const SizedBox(height: 4),
                        Text(p.name, style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w700)),
                      ],
                    ),
                  );
                }).toList(),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildTextMode(Persona persona) {
    return Column(
      children: [
        Expanded(
          child: ListView.builder(
            controller: _scrollController,
            padding: const EdgeInsets.all(16),
            itemCount: _messages.length + (_isSending ? 1 : 0),
            itemBuilder: (context, index) {
              if (index >= _messages.length) {
                return _buildBubble(context, role: 'model', text: '${persona.name} écrit…', muted: true);
              }
              final message = _messages[index];
              return _buildBubble(context, role: message.role, text: message.text);
            },
          ),
        ),
        if (_error != null)
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
            child: Text(_error!, style: const TextStyle(color: Colors.red, fontSize: 12)),
          ),
        SafeArea(
          top: false,
          child: Padding(
            padding: const EdgeInsets.fromLTRB(12, 8, 12, 12),
            child: Row(
              children: [
                if (_speechAvailable)
                  IconButton(
                    onPressed: _handleTextMicTap,
                    icon: Icon(_isRecording ? Icons.mic_off : Icons.mic, color: _isRecording ? AntaColors.red : null),
                  ),
                Expanded(
                  child: TextField(
                    controller: _controller,
                    enabled: !_isSending,
                    decoration: InputDecoration(
                      hintText: 'Write in English…',
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(999)),
                    ),
                    onSubmitted: (text) => _sendMessage(text, speak: false),
                  ),
                ),
                const SizedBox(width: 8),
                IconButton.filled(
                  onPressed: _isSending ? null : () => _sendMessage(_controller.text, speak: false),
                  icon: const Icon(Icons.send),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildVoiceMode(Persona persona) {
    if (!_speechAvailable) {
      return const Center(
        child: Padding(
          padding: EdgeInsets.all(24),
          child: Text(
            "La reconnaissance vocale n'est pas disponible sur cet appareil. Utilise le mode texte.",
            textAlign: TextAlign.center,
          ),
        ),
      );
    }

    String statusLabel;
    switch (_avatarState) {
      case 'listening':
        statusLabel = 'Je t’écoute…';
        break;
      case 'thinking':
        statusLabel = 'Je réfléchis…';
        break;
      case 'speaking':
        statusLabel = 'En train de parler…';
        break;
      default:
        statusLabel = 'Appuie sur le micro pour parler';
    }

    Color ringColor;
    switch (_avatarState) {
      case 'listening':
        ringColor = AntaColors.red;
        break;
      case 'speaking':
        ringColor = AntaColors.yellow;
        break;
      default:
        ringColor = AntaColors.slate200;
    }

    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 180,
            height: 180,
            decoration: BoxDecoration(shape: BoxShape.circle, border: Border.all(color: ringColor, width: 4)),
            padding: const EdgeInsets.all(6),
            child: ClipOval(child: Image.asset(persona.avatarAsset, fit: BoxFit.cover)),
          ),
          const SizedBox(height: 16),
          Text(persona.name, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
          const SizedBox(height: 4),
          Text(statusLabel, style: TextStyle(color: AntaColors.slate500)),
          const SizedBox(height: 24),
          GestureDetector(
            onTap: (_avatarState == 'thinking' || _avatarState == 'speaking') ? null : _handleVoiceMicTap,
            child: Container(
              width: 68,
              height: 68,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: _isRecording ? AntaColors.red : null,
                gradient: _isRecording ? null : const LinearGradient(colors: [AntaColors.red, AntaColors.yellow]),
              ),
              child: Icon(_isRecording ? Icons.mic_off : Icons.mic, color: Colors.white, size: 30),
            ),
          ),
          if (_error != null) ...[
            const SizedBox(height: 12),
            Text(_error!, style: const TextStyle(color: Colors.red, fontSize: 12)),
          ],
          const SizedBox(height: 16),
          TextButton.icon(
            onPressed: () => setState(() => _mode = 'text'),
            icon: const Icon(Icons.close, size: 16),
            label: const Text('Revenir au texte'),
          ),
        ],
      ),
    );
  }

  Widget _buildBubble(BuildContext context, {required String role, required String text, bool muted = false}) {
    final isUser = role == 'user';
    return Align(
      alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.75),
        decoration: BoxDecoration(
          color: isUser ? AntaColors.red : AntaColors.slate200.withValues(alpha: 0.5),
          borderRadius: BorderRadius.circular(18),
        ),
        child: Text(
          text,
          style: TextStyle(
            color: isUser ? Colors.white : (muted ? AntaColors.slate500 : AntaColors.slate900),
            fontStyle: muted ? FontStyle.italic : FontStyle.normal,
          ),
        ),
      ),
    );
  }
}
