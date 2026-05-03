<?php

namespace App\Imports;

use App\Models\Impuesto;
use Maatwebsite\Excel\Concerns\ToModel;

class ImpuestosImport implements ToModel
{
    /**
    * @param array $row
    *
    * @return \Illuminate\Database\Eloquent\Model|null
    */
    public function model(array $row)
    {
        return new Impuesto([
            //
        ]);
    }
}
