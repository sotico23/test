<?php

namespace App\Http\Requests\Backend;

use App\Rules\RutRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreProveedorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nombre' => ['required', 'string', 'max:255'],
            'nit' => ['nullable', 'string', 'max:50', 'unique:proveedors,nit', new RutRule],
            'telefono' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:255'],
            'direccion' => ['nullable', 'string', 'max:500'],
            'categoria_id' => ['nullable', 'exists:categorias,id'],
            'activo' => ['nullable', 'boolean'],
            'notas' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'nombre.required' => 'El nombre del proveedor es obligatorio.',
            'nit.unique' => 'Este RUT ya está registrado.',
            'email.email' => 'El correo electrónico debe ser válido.',
        ];
    }
}
