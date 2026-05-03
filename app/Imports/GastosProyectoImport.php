<?php

namespace App\Imports;

use App\Models\GastoProyecto;
use Maatwebsite\Excel\Concerns\ToModel;

class GastosProyectoImport implements ToModel
{
    /**
    * @param array $row
    *
    * @return \Illuminate\Database\Eloquent\Model|null
    */
    public function model(array $row)
    {
        return new GastoProyecto([
            //
        ]);
    }
}
