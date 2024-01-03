<script lang="ts" setup>
// Properties
defineProps<{
  modelValue: number;
  min?: number;
  max?: number;
  step?: number;
}>();

// Emits
defineEmits<{
  (e: 'update:modelValue', newValue: number): void
}>();
</script>

<template>
  <div class="flex gap-4 items-center">
    <input
      @input="$emit('update:modelValue', parseFloat(($event.target as HTMLInputElement).value))"
      class="w-5/6"
      :max="max"
      :min="min"
      :step="step ?? 'any'"
      type="range"
      :value="modelValue">
    <input
      @input="$emit('update:modelValue', parseFloat(($event.target as HTMLInputElement).value))"
      class="border-2 border-orange-200 outline-none p-1 transition-colors w-1/6 dark:bg-neutral-800 dark:border-neutral-700 dark:text-white dark:focus:border-white focus:border-orange-300"
      :max="max"
      :min="min"
      :step="step ?? 'any'"
      type="number"
      :value="modelValue">
  </div>
</template>

<style scoped>
input::-webkit-inner-spin-button,
input::-webkit-outer-spin-button {
  @apply appearance-none
}

input[type="number"] {
  @apply appearance-none
}
</style>
