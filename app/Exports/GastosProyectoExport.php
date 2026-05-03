<?php

namespace App\Exports;

use App\Models\GastoProyecto;
use Maatwebsite\Excel\Concerns\FromCollection;

class GastosProyectoExport implements FromCollection
{
    /**
    * @return \Illuminate\Support\Collection
    */
    public function collection()
    {
        return GastoProyecto::all();
    }
}
