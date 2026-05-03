<?php

namespace App\Imports;

use App\Models\Cobranza;
use Maatwebsite\Excel\Concerns\ToModel;

class CobranzasImport implements ToModel
{
    /**
    * @param array $row
    *
    * @return \Illuminate\Database\Eloquent\Model|null
    */
    public function model(array $row)
    {
        return new Cobranza([
            //
        ]);
    }
}
