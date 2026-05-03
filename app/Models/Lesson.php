<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Lesson extends Model
{
    protected $fillable = ['module_id', 'title', 'slug', 'description', 'content_text', 'video_url', 'code_sandbox', 'duration_minutes', 'order'];

    protected $casts = ['code_sandbox' => 'array'];

    public function module()
    {
        return $this->belongsTo(Module::class);
    }

    public function quiz()
    {
        return $this->hasOne(Quiz::class);
    }
}
