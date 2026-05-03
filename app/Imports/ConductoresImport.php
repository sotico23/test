<?php

namespace App\Imports;

use App\Models\Conductor;
use Maatwebsite\Excel\Concerns\ToModel;

class ConductoresImport implements ToModel
{
    /**
    * @param array $row
    *
    * @return \Illuminate\Database\Eloquent\Model|null
    */
    public function model(array $row)
    {
        return new Conductor([
            //
        ]);
    }
}
