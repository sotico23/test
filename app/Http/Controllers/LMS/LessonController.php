<?php

namespace App\Http\Controllers\LMS;

use App\Http\Controllers\Controller;
use App\Models\CourseProgress;
use App\Models\Lesson;
use App\Models\Module;
use App\Models\Quiz;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class LessonController extends Controller
{
    public function show(Lesson $lesson)
    {
        $lesson->load('module.course.modules.lessons', 'quiz');

        $course = $lesson->module->course;
        $course->load('modules.lessons');

        $allLessons = $course->modules->flatMap(fn ($module) => $module->lessons)->sortBy('order')->values();

        $currentIndex = $allLessons->search(fn ($l) => $l->id === $lesson->id);
        $previousLesson = $currentIndex > 0 ? $allLessons[$currentIndex - 1] : null;
        $nextLesson = $currentIndex < $allLessons->count() - 1 ? $allLessons[$currentIndex + 1] : null;

        $courseModules = $course->modules->map(fn ($module) => [
            'id' => $module->id,
            'title' => $module->title,
            'order' => $module->order,
            'lessons' => $module->lessons->map(fn ($l) => [
                'id' => $l->id,
                'title' => $l->title,
                'slug' => $l->slug,
                'order' => $l->order,
            ]),
        ]);

        return Inertia::render('LMS/Lessons/Show', [
            'lesson' => $lesson,
            'courseModules' => $courseModules,
            'nextLesson' => $nextLesson ? ['id' => $nextLesson->id, 'title' => $nextLesson->title, 'slug' => $nextLesson->slug] : null,
            'previousLesson' => $previousLesson ? ['id' => $previousLesson->id, 'title' => $previousLesson->title, 'slug' => $previousLesson->slug] : null,
        ]);
    }

    public function store(Request $request, Module $module)
    {
        if ($module->course->instructor_id !== auth()->id()) {
            abort(403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'video_url' => 'nullable|string',
        ]);

        $order = $module->lessons()->max('order') + 1;

        $lesson = $module->lessons()->create([
            'title' => $validated['title'],
            'description' => $validated['description'],
            'video_url' => $validated['video_url'],
            'slug' => Str::slug($validated['title']).'-'.rand(100, 999),
            'order' => $order,
            'content_text' => '',
        ]);

        return back()->with('success', 'Lección añadida.');
    }

    public function update(Request $request, Lesson $lesson)
    {
        if ($lesson->module->course->instructor_id !== auth()->id()) {
            abort(403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'content_text' => 'nullable|string',
            'video_url' => 'nullable|string',
            'order' => 'nullable|integer',
        ]);

        $lesson->update($validated);

        return back()->with('success', 'Lección actualizada.');
    }

    public function destroy(Lesson $lesson)
    {
        if ($lesson->module->course->instructor_id !== auth()->id()) {
            abort(403);
        }

        $lesson->delete();

        return back()->with('success', 'Lección eliminada.');
    }

    public function complete(Lesson $lesson)
    {
        CourseProgress::firstOrCreate([
            'user_id' => auth()->id(),
            'lesson_id' => $lesson->id,
        ], [
            'is_completed' => true,
            'completed_at' => now(),
        ]);

        return back()->with('success', 'Lección completada.');
    }

    public function storeQuiz(Request $request, Lesson $lesson)
    {
        if ($lesson->module->course->instructor_id !== auth()->id()) {
            abort(403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
        ]);

        $quiz = $lesson->quiz()->create([
            'title' => $validated['title'],
        ]);

        return back()->with('success', 'Quiz creado.');
    }

    public function updateQuiz(Request $request, Quiz $quiz)
    {
        if ($quiz->lesson->module->course->instructor_id !== auth()->id()) {
            abort(403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
        ]);

        $quiz->update($validated);

        return back()->with('success', 'Quiz actualizado.');
    }

    public function destroyQuiz(Quiz $quiz)
    {
        if ($quiz->lesson->module->course->instructor_id !== auth()->id()) {
            abort(403);
        }

        $quiz->delete();

        return back()->with('success', 'Quiz eliminado.');
    }
}
