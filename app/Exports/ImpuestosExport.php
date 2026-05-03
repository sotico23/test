<?php

namespace App\Exports;

use App\Models\Impuesto;
use Maatwebsite\Excel\Concerns\FromCollection;

class ImpuestosExport implements FromCollection
{
    /**
    * @return \Illuminate\Support\Collection
    */
    public function collection()
    {
        return Impuesto::all();
    }
}
