import 'dart:async';

import 'package:chewie/chewie.dart';
import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:video_player/video_player.dart';
import '../config/app_theme.dart';
import '../models/lesson_item.dart';
import '../models/question_item.dart';
import '../models/vocabulary_item.dart';
import 'app_shell.dart';

class _SubmittedAnswer {
  final String questionId;
  final int selectedIndex;
  _SubmittedAnswer(this.questionId, this.selectedIndex);
}

class _Mistake {
  final String questionText;
  final String yourAnswer;
  final String correctAnswer;
  final String? feedback;
  _Mistake({
    required this.questionText,
    required this.yourAnswer,
    required this.correctAnswer,
    required this.feedback,
  });
}

class LeconScreen extends StatefulWidget {
  final LessonItem lesson;
  final bool alreadyCompleted;

  const LeconScreen({
    super.key,
    required this.lesson,
    required this.alreadyCompleted,
  });

  @override
  State<LeconScreen> createState() => _LeconScreenState();
}

class _LeconScreenState extends State<LeconScreen> {
  bool _isLoading = true;
  String? _error;
  String? _submitError;
  bool _isSubmitting = false;

  List<VocabularyItem> _vocabulary = [];
  int _vocabIndex = 0;
  bool _vocabDone = false;

  List<QuestionItem> _questions = [];
  int _questionIndex = 0;
  int? _selectedIndex;
  final List<_SubmittedAnswer> _answers = [];
  int _finalScore = 0;

  Map<String, dynamic>? _result;
  List<_Mistake> _mistakes = [];
  List<Map<String, dynamic>> _newBadges = [];

  VideoPlayerController? _videoController;
  ChewieController? _chewieController;

  Timer? _ticker;
  int _elapsedSeconds = 0;

  bool get _hasQuestions =>
      widget.lesson.contentType == 'qcm' && _questions.isNotEmpty;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _ticker?.cancel();
    _chewieController?.dispose();
    _videoController?.dispose();
    super.dispose();
  }

  void _startTicker() {
    _ticker = Timer.periodic(const Duration(seconds: 1), (_) {
      if (!mounted) return;
      setState(() => _elapsedSeconds += 1);
    });
  }

  String _formatElapsed(int totalSeconds) {
    final minutes = (totalSeconds ~/ 60).toString().padLeft(2, '0');
    final seconds = (totalSeconds % 60).toString().padLeft(2, '0');
    return '$minutes:$seconds';
  }

  Future<void> _load() async {
    try {
      final vocabRows = await Supabase.instance.client
          .from('lesson_vocabulary')
          .select()
          .eq('lesson_id', widget.lesson.id)
          .order('order_index');
      _vocabulary = (vocabRows as List)
          .map((row) => VocabularyItem.fromMap(row as Map<String, dynamic>))
          .toList();
      _vocabDone = _vocabulary.isEmpty;

      if (widget.lesson.contentType == 'qcm') {
        final rows = await Supabase.instance.client
            .from('questions')
            .select()
            .eq('lesson_id', widget.lesson.id)
            .order('order_index');
        _questions = (rows as List)
            .map((row) => QuestionItem.fromMap(row as Map<String, dynamic>))
            .toList();
      } else if (widget.lesson.contentUrl != null &&
          (widget.lesson.contentType == 'video' ||
              widget.lesson.contentType == 'audio')) {
        final rawUrl = widget.lesson.contentUrl!;
        final playbackUrl = rawUrl.startsWith('http')
            ? rawUrl
            : await Supabase.instance.client.storage
                  .from('lesson-media')
                  .createSignedUrl(rawUrl, 3600);

        final controller = VideoPlayerController.networkUrl(
          Uri.parse(playbackUrl),
        );
        await controller.initialize();
        _videoController = controller;
        if (widget.lesson.contentType == 'video') {
          _chewieController = ChewieController(
            videoPlayerController: controller,
            autoPlay: false,
            looping: false,
          );
        }
      }
      setState(() => _isLoading = false);
      _startTicker();
    } catch (_) {
      setState(() {
        _error = 'Impossible de charger cette leçon.';
        _isLoading = false;
      });
    }
  }

  void _handleVocabNext() {
    if (_vocabIndex + 1 < _vocabulary.length) {
      setState(() => _vocabIndex += 1);
    } else {
      setState(() => _vocabDone = true);
    }
  }

  void _handleAnswer(int index) {
    if (_selectedIndex != null) return;
    final question = _questions[_questionIndex];
    setState(() {
      _selectedIndex = index;
      _answers.add(_SubmittedAnswer(question.id, index));
    });
  }

  void _handleNext() {
    if (_questionIndex + 1 < _questions.length) {
      setState(() {
        _questionIndex += 1;
        _selectedIndex = null;
      });
      return;
    }

    final finalAnswers = List<_SubmittedAnswer>.from(_answers);
    final correctCount = finalAnswers.where((answer) {
      final question = _questions.firstWhere((q) => q.id == answer.questionId);
      return answer.selectedIndex == question.correctIndex;
    }).length;
    _finalScore = correctCount;
    final score = (correctCount / _questions.length * 5).round();
    _finishLesson(score, finalAnswers);
  }

  List<_Mistake> _buildMistakes(List<_SubmittedAnswer> finalAnswers) {
    final mistakes = <_Mistake>[];
    for (final answer in finalAnswers) {
      final question = _questions.firstWhere((q) => q.id == answer.questionId);
      if (answer.selectedIndex == question.correctIndex) continue;
      mistakes.add(
        _Mistake(
          questionText: question.questionText,
          yourAnswer: question.options.length > answer.selectedIndex
              ? question.options[answer.selectedIndex]
              : '—',
          correctAnswer: question.options.length > question.correctIndex
              ? question.options[question.correctIndex]
              : '—',
          feedback: question.explanation,
        ),
      );
    }
    return mistakes;
  }

  Future<void> _finishLesson(
    int? score,
    List<_SubmittedAnswer> finalAnswers,
  ) async {
    setState(() {
      _isSubmitting = true;
      _submitError = null;
    });
    try {
      final response = await Supabase.instance.client.rpc(
        'complete_lesson',
        params: {'p_lesson_id': widget.lesson.id, 'p_score': score},
      );
      final data = response as Map<String, dynamic>?;
      _ticker?.cancel();
      setState(() {
        _mistakes = _buildMistakes(finalAnswers);
        _newBadges = ((data?['new_badges'] as List?) ?? [])
            .cast<Map<String, dynamic>>();
        _result = {
          'xp_earned': (data?['xp_earned'] as num?)?.toInt() ?? 0,
          'total_xp': (data?['total_xp'] as num?)?.toInt() ?? 0,
          'current_streak': (data?['current_streak'] as num?)?.toInt() ?? 0,
        };
      });
    } catch (e) {
      setState(() => _submitError = 'Une erreur est survenue. Réessaie.');
    } finally {
      setState(() => _isSubmitting = false);
    }
  }

  void _goToDashboard() {
    AppShell.of(context)?.goToTab(0);
    Navigator.of(context).popUntil((route) => route.isFirst);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.lesson.title),
        actions: [
          if (_result == null && !_isLoading)
            Padding(
              padding: const EdgeInsets.only(right: 16),
              child: Center(
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 10,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: AntaColors.slate200.withValues(alpha: 0.5),
                    borderRadius: BorderRadius.circular(999),
                  ),
                  child: Text(
                    '⏱ ${_formatElapsed(_elapsedSeconds)}',
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
              ),
            ),
        ],
      ),
      body: SafeArea(child: _buildBody()),
    );
  }

  Widget _buildBody() {
    if (_isLoading) return const Center(child: CircularProgressIndicator());
    if (_error != null) return Center(child: Text(_error!));
    if (_result != null) return _buildResult();

    final showVocab = !_vocabDone && _vocabulary.isNotEmpty;
    final reduceMotion = MediaQuery.of(context).disableAnimations;

    return AnimatedSwitcher(
      duration: reduceMotion
          ? Duration.zero
          : const Duration(milliseconds: 300),
      transitionBuilder: (child, animation) => FadeTransition(
        opacity: animation,
        child: SlideTransition(
          position: Tween<Offset>(
            begin: const Offset(0.05, 0),
            end: Offset.zero,
          ).animate(animation),
          child: child,
        ),
      ),
      child: showVocab
          ? SingleChildScrollView(
              key: ValueKey('vocab-${_vocabulary[_vocabIndex].id}'),
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: _buildVocabCard(_vocabulary[_vocabIndex]),
              ),
            )
          : SingleChildScrollView(
              key: ValueKey(
                _hasQuestions ? 'question-$_questionIndex' : 'content',
              ),
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: _buildLessonContent(),
              ),
            ),
    );
  }

  List<Widget> _buildVocabCard(VocabularyItem item) {
    return [
      Text(
        'Vocabulaire ${_vocabIndex + 1} / ${_vocabulary.length}',
        style: TextStyle(
          fontWeight: FontWeight.w600,
          color: AntaColors.slate500,
        ),
      ),
      const SizedBox(height: 12),
      Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: AntaColors.slate200),
          gradient: LinearGradient(
            colors: [
              Colors.white,
              AntaColors.yellow.withValues(alpha: 0.08),
              AntaColors.green.withValues(alpha: 0.08),
            ],
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              item.word,
              style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w800),
            ),
            const SizedBox(height: 8),
            Text(item.definition, style: const TextStyle(fontSize: 16)),
            if (item.example != null) ...[
              const SizedBox(height: 10),
              Text(
                '« ${item.example} »',
                style: TextStyle(
                  fontStyle: FontStyle.italic,
                  color: AntaColors.slate500,
                ),
              ),
            ],
            if (item.audioUrl != null) ...[
              const SizedBox(height: 14),
              _VocabAudioButton(
                key: ValueKey(item.audioUrl),
                url: item.audioUrl!,
              ),
            ],
          ],
        ),
      ),
      const SizedBox(height: 16),
      ElevatedButton(
        onPressed: _handleVocabNext,
        child: Text(
          _vocabIndex + 1 < _vocabulary.length
              ? 'Mot suivant'
              : 'Passer au QCM',
        ),
      ),
    ];
  }

  List<Widget> _buildLessonContent() {
    return [
      if (widget.lesson.description != null) ...[
        Text(
          widget.lesson.description!,
          style: TextStyle(color: AntaColors.slate500),
        ),
        const SizedBox(height: 20),
      ],
      if (widget.lesson.contentType == 'video' &&
          _chewieController != null) ...[
        AspectRatio(
          aspectRatio: _videoController!.value.aspectRatio == 0
              ? 16 / 9
              : _videoController!.value.aspectRatio,
          child: Chewie(controller: _chewieController!),
        ),
        const SizedBox(height: 20),
      ],
      if (widget.lesson.contentType == 'audio' && _videoController != null) ...[
        _AudioControls(controller: _videoController!),
        const SizedBox(height: 20),
      ],
      if (widget.lesson.contentType == 'pdf')
        const Text('Ce cours est en cours de préparation.'),
      if (_hasQuestions) ..._buildQcm(),
      if (widget.lesson.contentType == 'qcm' && _questions.isEmpty)
        const Text("Cette leçon n'a pas encore de questions."),
      if (widget.lesson.contentType != 'qcm') ...[
        ElevatedButton(
          onPressed: _isSubmitting ? null : () => _finishLesson(null, []),
          child: Text(
            _isSubmitting
                ? 'Enregistrement…'
                : widget.alreadyCompleted
                ? 'Revalider comme terminée'
                : 'Marquer comme terminée',
          ),
        ),
      ],
      if (_submitError != null) ...[
        const SizedBox(height: 12),
        Text(_submitError!, style: const TextStyle(color: AntaColors.red)),
      ],
    ];
  }

  List<Widget> _buildQcm() {
    final question = _questions[_questionIndex];
    final answered = _selectedIndex != null;
    return [
      Text(
        'Question ${_questionIndex + 1} / ${_questions.length}',
        style: TextStyle(
          fontWeight: FontWeight.w600,
          color: AntaColors.slate500,
        ),
      ),
      const SizedBox(height: 8),
      Text(
        question.questionText,
        style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700),
      ),
      const SizedBox(height: 16),
      ...List.generate(question.options.length, (index) {
        final isCorrect = index == question.correctIndex;
        final isSelected = index == _selectedIndex;
        Color borderColor = AntaColors.slate200;
        Color? bgColor;
        if (answered && isCorrect) {
          borderColor = AntaColors.green;
          bgColor = AntaColors.green.withValues(alpha: 0.1);
        } else if (answered && isSelected && !isCorrect) {
          borderColor = AntaColors.red;
          bgColor = AntaColors.red.withValues(alpha: 0.1);
        }
        return Padding(
          padding: const EdgeInsets.only(bottom: 10),
          child: OutlinedButton(
            onPressed: answered ? null : () => _handleAnswer(index),
            style: OutlinedButton.styleFrom(
              alignment: Alignment.centerLeft,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
              side: BorderSide(color: borderColor),
              backgroundColor: bgColor,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(14),
              ),
            ),
            child: Row(
              children: [
                Expanded(child: Text(question.options[index])),
                if (answered && isCorrect)
                  const Icon(Icons.check, size: 18, color: AntaColors.green),
                if (answered && isSelected && !isCorrect)
                  const Icon(Icons.close, size: 18, color: AntaColors.red),
              ],
            ),
          ),
        );
      }),
      if (answered && question.explanation != null) ...[
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: AntaColors.slate200.withValues(alpha: 0.4),
            borderRadius: BorderRadius.circular(14),
          ),
          child: Text('💡 ${question.explanation}'),
        ),
        const SizedBox(height: 16),
      ],
      if (answered)
        ElevatedButton(
          onPressed: _isSubmitting ? null : _handleNext,
          child: Text(
            _questionIndex + 1 < _questions.length
                ? 'Question suivante'
                : _isSubmitting
                ? 'Correction en cours…'
                : 'Terminer la leçon',
          ),
        ),
    ];
  }

  Widget _buildResult() {
    final total = _hasQuestions ? _questions.length : 0;
    final xpEarned = (_result!['xp_earned'] as int?) ?? 0;
    final currentStreak = (_result!['current_streak'] as int?) ?? 0;

    return Center(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            const Text('🎉', style: TextStyle(fontSize: 56)),
            const SizedBox(height: 12),
            const Text(
              'Leçon terminée !',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.w900),
            ),
            if (total > 0) ...[
              const SizedBox(height: 8),
              Text(
                'Score : $_finalScore / $total',
                style: TextStyle(fontSize: 16, color: AntaColors.slate500),
              ),
            ],
            const SizedBox(height: 8),
            if (xpEarned > 0)
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.bolt, size: 18, color: AntaColors.red),
                  const SizedBox(width: 4),
                  Text(
                    '+$xpEarned XP',
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      color: AntaColors.red,
                    ),
                  ),
                ],
              )
            else
              const Text(
                'XP déjà comptabilisé pour cette leçon.',
                style: TextStyle(fontSize: 14, color: AntaColors.slate500),
              ),
            const SizedBox(height: 4),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  Icons.local_fire_department,
                  size: 16,
                  color: AntaColors.slate500,
                ),
                const SizedBox(width: 4),
                Text(
                  'Streak actuelle : $currentStreak',
                  style: TextStyle(color: AntaColors.slate500),
                ),
              ],
            ),
            if (_newBadges.isNotEmpty) ...[
              const SizedBox(height: 16),
              Text(
                _newBadges.length > 1
                    ? 'Nouveaux badges débloqués !'
                    : 'Nouveau badge débloqué !',
                style: const TextStyle(
                  fontWeight: FontWeight.w700,
                  fontSize: 13,
                ),
              ),
              const SizedBox(height: 10),
              Wrap(
                spacing: 10,
                runSpacing: 10,
                alignment: WrapAlignment.center,
                children: _newBadges.map((badge) {
                  return Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 14,
                      vertical: 8,
                    ),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(999),
                      border: Border.all(
                        color: AntaColors.yellow.withValues(alpha: 0.6),
                      ),
                      gradient: LinearGradient(
                        colors: [
                          Colors.white,
                          AntaColors.yellow.withValues(alpha: 0.1),
                          AntaColors.green.withValues(alpha: 0.1),
                        ],
                      ),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          badge['icon'] as String? ?? '🏅',
                          style: const TextStyle(fontSize: 20),
                        ),
                        const SizedBox(width: 6),
                        Text(
                          badge['name'] as String? ?? '',
                          style: const TextStyle(fontWeight: FontWeight.w700),
                        ),
                      ],
                    ),
                  );
                }).toList(),
              ),
            ],
            if (_mistakes.isNotEmpty) ...[
              const SizedBox(height: 20),
              const Align(
                alignment: Alignment.centerLeft,
                child: Text(
                  "Ce qu'il fallait retenir",
                  style: TextStyle(fontWeight: FontWeight.w700),
                ),
              ),
              const SizedBox(height: 12),
              ..._mistakes.map(
                (mistake) => Container(
                  margin: const EdgeInsets.only(bottom: 10),
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: AntaColors.red.withValues(alpha: 0.06),
                    border: Border.all(
                      color: AntaColors.red.withValues(alpha: 0.3),
                    ),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        mistake.questionText,
                        style: const TextStyle(fontWeight: FontWeight.w700),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Ta réponse : ${mistake.yourAnswer} — Bonne réponse : ${mistake.correctAnswer}',
                        style: const TextStyle(color: AntaColors.red),
                      ),
                      if (mistake.feedback != null) ...[
                        const SizedBox(height: 6),
                        Text('💡 ${mistake.feedback}'),
                      ],
                    ],
                  ),
                ),
              ),
            ],
            const SizedBox(height: 20),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                OutlinedButton(
                  onPressed: () => Navigator.of(context).pop(),
                  child: const Text('Retour au module'),
                ),
                const SizedBox(width: 12),
                ElevatedButton(
                  onPressed: _goToDashboard,
                  child: const Text('Dashboard'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _AudioControls extends StatelessWidget {
  final VideoPlayerController controller;
  const _AudioControls({required this.controller});

  String _formatDuration(Duration d) {
    final minutes = d.inMinutes.remainder(60).toString().padLeft(2, '0');
    final seconds = d.inSeconds.remainder(60).toString().padLeft(2, '0');
    return '$minutes:$seconds';
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: AntaColors.slate200.withValues(alpha: 0.3),
        borderRadius: BorderRadius.circular(999),
      ),
      child: AnimatedBuilder(
        animation: controller,
        builder: (context, _) {
          final value = controller.value;
          return Row(
            children: [
              IconButton(
                icon: Icon(
                  value.isPlaying
                      ? Icons.pause_circle_filled
                      : Icons.play_circle_fill,
                  size: 36,
                ),
                onPressed: () =>
                    value.isPlaying ? controller.pause() : controller.play(),
              ),
              Expanded(
                child: Slider(
                  value: value.position.inMilliseconds
                      .clamp(0, value.duration.inMilliseconds)
                      .toDouble(),
                  max: value.duration.inMilliseconds.toDouble().clamp(
                    1,
                    double.infinity,
                  ),
                  onChanged: (v) =>
                      controller.seekTo(Duration(milliseconds: v.toInt())),
                ),
              ),
              Text(
                '${_formatDuration(value.position)} / ${_formatDuration(value.duration)}',
              ),
            ],
          );
        },
      ),
    );
  }
}

class _VocabAudioButton extends StatefulWidget {
  final String url;
  const _VocabAudioButton({super.key, required this.url});

  @override
  State<_VocabAudioButton> createState() => _VocabAudioButtonState();
}

class _VocabAudioButtonState extends State<_VocabAudioButton> {
  VideoPlayerController? _controller;
  bool _isLoading = false;

  @override
  void dispose() {
    _controller?.dispose();
    super.dispose();
  }

  Future<void> _toggle() async {
    if (_controller == null) {
      setState(() => _isLoading = true);
      final controller = VideoPlayerController.networkUrl(
        Uri.parse(widget.url),
      );
      await controller.initialize();
      await controller.play();
      setState(() {
        _controller = controller;
        _isLoading = false;
      });
      return;
    }
    setState(() {
      _controller!.value.isPlaying ? _controller!.pause() : _controller!.play();
    });
  }

  @override
  Widget build(BuildContext context) {
    final isPlaying = _controller?.value.isPlaying ?? false;
    return OutlinedButton.icon(
      onPressed: _isLoading ? null : _toggle,
      icon: _isLoading
          ? const SizedBox(
              width: 16,
              height: 16,
              child: CircularProgressIndicator(strokeWidth: 2),
            )
          : Icon(isPlaying ? Icons.pause : Icons.volume_up),
      label: Text(isPlaying ? 'Pause' : 'Écouter'),
    );
  }
}
