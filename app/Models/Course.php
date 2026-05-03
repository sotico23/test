<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    protected $fillable = ['instructor_id', 'owner_id', 'category_id', 'title', 'slug', 'description', 'price', 'cover_image', 'promo_video_url', 'is_published', 'features'];

    protected $casts = ['features' => 'array', 'is_published' => 'boolean'];

    public function category()
    {
        return $this->belongsTo(Categoria::class, 'category_id');
    }

    public function instructor()
    {
        return $this->belongsTo(User::class, 'instructor_id');
    }

    public function modules()
    {
        return $this->hasMany(Module::class)->orderBy('order');
    }

    public function lessons()
    {
        return $this->hasManyThrough(Lesson::class, Module::class);
    }

    public function enrollments()
    {
        return $this->hasMany(Enrollment::class);
    }
}
