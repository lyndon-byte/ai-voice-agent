<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KnowledgeBase extends Model
{
    public const TYPE_URL     = 'url';
    public const TYPE_FOLDER = 'folder';
    public const TYPE_TEXT    = 'text';
    public const TYPE_FILE    = 'file';
    
    protected $fillable = [
        
        'organization_id',
        'document_id',
        'name',
        'type',
        'created_by',
        
    ];
}
