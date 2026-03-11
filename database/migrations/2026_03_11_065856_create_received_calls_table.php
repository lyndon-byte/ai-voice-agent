<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('received_calls', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->nullable()->constrained('tenants')->cascadeOnDelete();
            $table->string('agent_id');
            $table->string('agent_name');
            $table->integer('duration');
            $table->integer('credits');
            $table->decimal('llm_cost', 10, 6);           
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('received_calls');
    }
};
