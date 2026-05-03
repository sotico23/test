<?php

namespace App\Exports;

use App\Models\Conductor;
use Maatwebsite\Excel\Concerns\FromCollection;

class ConductoresExport implements FromCollection
{
    /**
    * @return \Illuminate\Support\Collection
    */
    public function collection()
    {
        return Conductor::all();
    }
}
