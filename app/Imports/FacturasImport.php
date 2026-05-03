<?php

namespace App\Imports;

use App\Models\Factura;
use Maatwebsite\Excel\Concerns\ToModel;

class FacturasImport implements ToModel
{
    /**
    * @param array $row
    *
    * @return \Illuminate\Database\Eloquent\Model|null
    */
    public function model(array $row)
    {
        return new Factura([
            //
        ]);
    }
}
