import 'dart:async';
import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../config/app_theme.dart';
import '../app_shell.dart';

const _questionSeconds = 20;

class _PlacementQuestion {
  final String id;
  final String topic;
  final String text;
  final List<String> options;

  _PlacementQuestion({
    required this.id,
    required this.topic,
    required this.text,
    required this.options,
  });

  factory _PlacementQuestion.fromMap(Map<String, dynamic> map) {
    return _PlacementQuestion(
      id: map['question_id'] as String,
      topic: map['topic'] as String,
      text: map['question_text'] as String,
      options: (map['options'] as List).map((o) => o.toString()).toList(),
    );
  }
}

class PlacementTestScreen extends StatefulWidget {
  const PlacementTestScreen({super.key});

  @override
  State<PlacementTestScreen> createState() => _PlacementTestScreenState();
}

class _PlacementTestScreenState extends State<PlacementTestScreen> {
  String _step = 'loading'; // loading | intro | quiz | submitting | error | result
  List<_PlacementQuestion> _questions = [];
  int _questionIndex = 0;
  int? _selected;
  int _secondsLeft = _questionSeconds;
  Timer? _timer;
  final List<Map<String, dynamic>> _answers = [];
  String? _resultLevel;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadQuestions();
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  Future<void> _loadQuestions() async {
    try {
      final rows = await Supabase.instance.client.rpc('get_placement_test');
      final questions = (rows as List)
          .map((row) => _PlacementQuestion.fromMap(row as Map<String, dynamic>))
          .toList();
      setState(() {
        _questions = questions;
        _step = 'intro';
      });
    } catch (e) {
      setState(() {
        _error = 'Impossible de charger le test de niveau.';
        _step = 'error';
      });
    }
  }

  void _startQuiz() {
    setState(() {
      _step = 'quiz';
      _questionIndex = 0;
      _selected = null;
      _secondsLeft = _questionSeconds;
    });
    _startTimer();
  }

  void _startTimer() {
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_secondsLeft <= 1) {
        timer.cancel();
        _advance(_selected ?? -1);
      } else {
        setState(() => _secondsLeft -= 1);
      }
    });
  }

  void _handleSelect(int index) {
    if (_selected != null) return;
    setState(() => _selected = index);
    _timer?.cancel();
    Future.delayed(const Duration(milliseconds: 450), () => _advance(index));
  }

  void _advance(int selectedIndex) {
    _answers.add({
      'question_id': _questions[_questionIndex].id,
      'selected_index': selectedIndex,
    });

    if (_questionIndex + 1 < _questions.length) {
      setState(() {
        _questionIndex += 1;
        _selected = null;
        _secondsLeft = _questionSeconds;
      });
      _startTimer();
    } else {
      _submit();
    }
  }

  Future<void> _submit() async {
    setState(() => _step = 'submitting');
    try {
      final result = await Supabase.instance.client
          .rpc('submit_placement_test', params: {'p_answers': _answers})
          .timeout(const Duration(seconds: 15));
      final row = (result as List).first as Map<String, dynamic>;
      setState(() {
        _resultLevel = row['level'] as String;
        _step = 'result';
      });
    } catch (e) {
      setState(() {
        _error = 'Impossible de calculer ton niveau pour l\'instant.';
        _step = 'error';
      });
    }
  }

  void _goToApp() {
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(builder: (_) => const AppShell()),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 480),
              child: _buildStep(context),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildStep(BuildContext context) {
    switch (_step) {
      case 'loading':
        return const Padding(
          padding: EdgeInsets.symmetric(vertical: 60),
          child: Center(child: CircularProgressIndicator()),
        );
      case 'intro':
        return _buildIntro(context);
      case 'quiz':
        return _buildQuiz(context);
      case 'submitting':
        return const Padding(
          padding: EdgeInsets.symmetric(vertical: 40),
          child: Center(child: Text('Calcul de ton niveau…')),
        );
      case 'error':
        return _buildError(context);
      case 'result':
        return _buildResult(context);
      default:
        return const SizedBox.shrink();
    }
  }

  Widget _buildIntro(BuildContext context) {
    final topic = _questions.isNotEmpty ? _questions.first.topic : '';
    return Column(
      children: [
        const Icon(Icons.auto_awesome, color: AntaColors.red, size: 48),
        const SizedBox(height: 16),
        Text(
          'À toi de jouer !',
          style: Theme.of(context).textTheme.headlineSmall,
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 12),
        Text(
          'Un petit quiz de ${_questions.length} questions sur le thème « $topic » pour découvrir ton niveau d\'anglais. Tu as 20 secondes par question — fais confiance à tes réflexes !',
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 20),
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: _startQuiz,
            child: const Text("C'est parti"),
          ),
        ),
      ],
    );
  }

  Widget _buildQuiz(BuildContext context) {
    final question = _questions[_questionIndex];
    final urgent = _secondsLeft <= 10;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Question ${_questionIndex + 1} / ${_questions.length}',
              style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 12),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: urgent ? Colors.red.withValues(alpha: 0.15) : AntaColors.slate200.withValues(alpha: 0.5),
                borderRadius: BorderRadius.circular(999),
              ),
              child: Text(
                '${_secondsLeft}s',
                style: TextStyle(
                  fontWeight: FontWeight.w800,
                  color: urgent ? Colors.red : AntaColors.slate500,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        ClipRRect(
          borderRadius: BorderRadius.circular(999),
          child: LinearProgressIndicator(
            value: _secondsLeft / _questionSeconds,
            minHeight: 6,
            backgroundColor: AntaColors.slate200.withValues(alpha: 0.5),
            color: urgent ? Colors.red : AntaColors.red,
          ),
        ),
        const SizedBox(height: 20),
        Text(
          question.text,
          style: Theme.of(context).textTheme.titleLarge,
        ),
        const SizedBox(height: 16),
        ...List.generate(question.options.length, (index) {
          final isSelected = _selected == index;
          return Padding(
            padding: const EdgeInsets.only(bottom: 10),
            child: OutlinedButton(
              onPressed: _selected == null ? () => _handleSelect(index) : null,
              style: OutlinedButton.styleFrom(
                alignment: Alignment.centerLeft,
                padding: const EdgeInsets.all(16),
                backgroundColor: isSelected ? AntaColors.red.withValues(alpha: 0.08) : null,
                side: BorderSide(color: isSelected ? AntaColors.red : AntaColors.slate200),
              ),
              child: Text(question.options[index]),
            ),
          );
        }),
      ],
    );
  }

  Widget _buildError(BuildContext context) {
    return Column(
      children: [
        Text(_error ?? 'Une erreur est survenue.', textAlign: TextAlign.center),
        const SizedBox(height: 16),
        ElevatedButton(
          onPressed: _step == 'error' && _questions.isEmpty ? _loadQuestions : _submit,
          child: const Text('Réessayer'),
        ),
      ],
    );
  }

  Widget _buildResult(BuildContext context) {
    final labels = {
      'debutant': ('🌱', 'Débutant'),
      'intermediaire': ('🚀', 'Intermédiaire'),
      'avance': ('🏆', 'Avancé'),
    };
    final (emoji, label) = labels[_resultLevel] ?? ('🌱', 'Débutant');
    return Column(
      children: [
        const Icon(Icons.celebration, color: AntaColors.red, size: 48),
        const SizedBox(height: 16),
        Text(
          '$emoji Niveau $label',
          style: Theme.of(context).textTheme.headlineSmall,
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 12),
        const Text(
          'Tes leçons seront adaptées à ce niveau — tu pourras progresser au fil du temps.',
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 20),
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: _goToApp,
            child: const Text('Aller à mon dashboard'),
          ),
        ),
      ],
    );
  }
}
