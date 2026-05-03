<?php

namespace App\Exports;

use App\Models\Asiento;
use Maatwebsite\Excel\Concerns\FromCollection;

class ContabilidadExport implements FromCollection
{
    /**
    * @return \Illuminate\Support\Collection
    */
    public function collection()
    {
        return Asiento::all();
    }
}
