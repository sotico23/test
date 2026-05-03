<?php

namespace App\Exports;

use App\Models\Cobranza;
use Maatwebsite\Excel\Concerns\FromCollection;

class CobranzasExport implements FromCollection
{
    /**
    * @return \Illuminate\Support\Collection
    */
    public function collection()
    {
        return Cobranza::all();
    }
}
