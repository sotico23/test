<?php

use App\Http\Controllers\LMS\CourseController;
use App\Http\Controllers\LMS\InstructorCourseController;
use App\Http\Controllers\LMS\LessonController;
use App\Http\Controllers\LMS\ModuleController;
use App\Http\Controllers\LMS\StudentController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    // Alumno Routes
    Route::get('/cursos', [CourseController::class, 'index'])->name('lms.courses.index');
    Route::get('/cursos/{course:slug}', [CourseController::class, 'show'])->name('lms.courses.show');
    Route::post('/cursos/{course}/enroll', [CourseController::class, 'enroll'])->name('lms.courses.enroll');

    Route::get('/alumno/cursos', [StudentController::class, 'myCourses'])->name('lms.student.courses');
    Route::get('/alumno/progreso', [StudentController::class, 'progress'])->name('lms.student.progress');

    Route::get('/lecciones/{lesson:slug}', [LessonController::class, 'show'])->name('lms.lessons.show');
    Route::post('/lecciones/{lesson}/complete', [LessonController::class, 'complete'])->name('lms.lessons.complete');

    // Instructor Routes
    Route::name('lms.instructor.')->prefix('instructor')->group(function () {
        Route::get('/dashboard', [StudentController::class, 'instructorDashboard'])->name('dashboard');
        Route::resource('cursos', InstructorCourseController::class)->parameters(['cursos' => 'course']);
        Route::post('cursos/{course}/publish', [InstructorCourseController::class, 'publish'])->name('cursos.publish');

        // Módulos
        Route::post('cursos/{course}/modules', [ModuleController::class, 'store'])->name('modules.store');
        Route::put('modules/{module}', [ModuleController::class, 'update'])->name('modules.update');
        Route::delete('modules/{module}', [ModuleController::class, 'destroy'])->name('modules.destroy');

        // Lecciones
        Route::post('modules/{module}/lessons', [LessonController::class, 'store'])->name('lessons.store');
        Route::put('lessons/{lesson}', [LessonController::class, 'update'])->name('lessons.update');
        Route::delete('lessons/{lesson}', [LessonController::class, 'destroy'])->name('lessons.destroy');

        // Quiz
        Route::post('lessons/{lesson}/quiz', [LessonController::class, 'storeQuiz'])->name('lessons.quiz.store');
        Route::put('quizzes/{quiz}', [LessonController::class, 'updateQuiz'])->name('quizzes.update');
        Route::delete('quizzes/{quiz}', [LessonController::class, 'destroyQuiz'])->name('quizzes.destroy');

        // Certificates
        Route::get('courses/{course}/certificate', [StudentController::class, 'generateCertificate'])->name('courses.certificate');
    });
});
