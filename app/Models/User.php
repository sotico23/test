<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, HasRoles, Notifiable, TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'profile_photo_path',
        'cover_photo_path',
        'job',
        'location',
        'rut',
        'razon_social',
        'giro',
        'telefono',
        'direccion',
        'ciudad',
        'region',
        'comuna',
        'fecha_nacimiento',
        'genero',
        'tipo_entidad',
        'show_onboarding',
    ];

    protected static function boot(): void
    {
        parent::boot();

        static::created(function (User $user) {
            $userCount = User::count();

            if ($userCount === 1) {
                $user->assignRole('Super Admin');
            } else {
                $user->assignRole('Administrador');
            }
        });
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'creator_id');
    }

    public function subordinates()
    {
        return $this->hasMany(User::class, 'creator_id');
    }

    public function empleado()
    {
        return $this->hasOne(Empleado::class);
    }

    public function cliente()
    {
        return $this->hasOne(Cliente::class);
    }

    public function mensajesEnviados()
    {
        return $this->hasMany(Mensaje::class, 'sender_id');
    }

    public function mensajesRecibidos()
    {
        return $this->hasMany(Mensaje::class, 'receiver_id');
    }

    public function publicacion(): HasMany
    {
        return $this->hasMany(Publicacion::class);
    }

    public function followers(): HasMany
    {
        return $this->hasMany(Follower::class, 'followed_id');
    }

    public function following(): HasMany
    {
        return $this->hasMany(Follower::class, 'user_id');
    }

    public function publicProfile()
    {
        return $this->hasOne(PublicProfile::class);
    }

    public function monitoredSites()
    {
        return $this->hasMany(MonitoredSite::class);
    }

    public function uptimeAlerts()
    {
        return $this->hasMany(UptimeAlert::class);
    }

    public function getClienteActual(): ?Cliente
    {
        if ($this->hasRole('Cliente') && $this->cliente) {
            return $this->cliente;
        }

        return null;
    }

    public function getOwnerId(): int
    {
        if ($this->creator_id) {
            $creator = self::find($this->creator_id);

            return $creator ? $creator->getOwnerId() : $this->creator_id;
        }

        return $this->id;
    }

    public function isCliente(): bool
    {
        return $this->hasRole('Cliente') && $this->cliente !== null;
    }

    public function isFollowedBy(?User $user): bool
    {
        if (! $user) {
            return false;
        }

        return $this->followers()->whereUserId($user->id)->exists();
    }

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    public function profilePhotoUrl(): string
    {
        if (! $this->profile_photo_path) {
            return $this->defaultProfilePhotoUrl();
        }

        if (filter_var($this->profile_photo_path, FILTER_VALIDATE_URL)) {
            return $this->profile_photo_path;
        }

        return asset('storage/'.$this->profile_photo_path);
    }

    public function defaultProfilePhotoUrl(): string
    {
        return 'https://ui-avatars.com/api/?name='.urlencode($this->name).'&color=random';
    }

    public function coverPhotoUrl(): string
    {
        if (! $this->cover_photo_path) {
            return '';
        }

        if (filter_var($this->cover_photo_path, FILTER_VALIDATE_URL)) {
            return $this->cover_photo_path;
        }

        return asset('storage/'.$this->cover_photo_path);
    }

    public function toArray(): array
    {
        return array_merge(parent::toArray(), [
            'profile_photo_url' => $this->profilePhotoUrl(),
            'cover_photo_url' => $this->coverPhotoUrl(),
        ]);
    }
}
