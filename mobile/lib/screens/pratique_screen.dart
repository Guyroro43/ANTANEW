import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:supabase_flutter/supabase_flutter.dart';
import '../config/api_config.dart';
import '../config/app_theme.dart';

class _ChatMessage {
  final String role; // 'user' | 'model'
  final String text;

  _ChatMessage({required this.role, required this.text});
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
  bool _isSending = false;
  String? _error;

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
  }

  @override
  void dispose() {
    _controller.dispose();
    _scrollController.dispose();
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

  Future<void> _handleSend() async {
    final text = _controller.text.trim();
    if (text.isEmpty || _isSending) return;

    final history = _messages.map((m) => {'role': m.role, 'text': m.text}).toList();

    setState(() {
      _messages.add(_ChatMessage(role: 'user', text: text));
      _controller.clear();
      _isSending = true;
      _error = null;
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
            body: jsonEncode({'message': text, 'history': history}),
          )
          .timeout(const Duration(seconds: 30));

      final data = jsonDecode(response.body) as Map<String, dynamic>;
      if (response.statusCode != 200) {
        throw Exception(data['error'] ?? 'Échec de la réponse IA.');
      }

      setState(() => _messages.add(_ChatMessage(role: 'model', text: data['reply'] as String)));
    } catch (e) {
      setState(() => _error = 'Échec de la réponse IA.');
    } finally {
      if (mounted) setState(() => _isSending = false);
      _scrollToBottom();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Expanded(
          child: ListView.builder(
            controller: _scrollController,
            padding: const EdgeInsets.all(16),
            itemCount: _messages.length + (_isSending ? 1 : 0),
            itemBuilder: (context, index) {
              if (index >= _messages.length) {
                return _buildBubble(context, role: 'model', text: 'Kora écrit…', muted: true);
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
                Expanded(
                  child: TextField(
                    controller: _controller,
                    enabled: !_isSending,
                    decoration: InputDecoration(
                      hintText: 'Write in English…',
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(999)),
                    ),
                    onSubmitted: (_) => _handleSend(),
                  ),
                ),
                const SizedBox(width: 8),
                IconButton.filled(
                  onPressed: _isSending ? null : _handleSend,
                  icon: const Icon(Icons.send),
                ),
              ],
            ),
          ),
        ),
      ],
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
