<template>
  <div class="flex flex-col gap-2 my-4">
    <div class="flex justify-center gap-2">
      <button @click="markStart" :disabled="loadingStart" class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 w-[200px]">Mark Start</button>
      <button @click="markEnd" :disabled="loadingEnd" class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 w-[200px]">Mark End</button>
    </div>
    <div v-if="message" class="text-center text-neutral-500 font-bold">{{message}}</div>
  </div>
</template>
<script setup>
import { ref } from 'vue';
import api from '../services/api';
const loadingStart = ref(false), loadingEnd = ref(false), message = ref('');
async function markStart() {
  loadingStart.value = true;
  try {
    const { data } = await api.post('/attendance/start');
    message.value = `Start marked at ${new Date(data.attendance.start_ts).toLocaleTimeString()}`;
  } catch (e) { message.value = e.response?.data?.message || 'Error'; }
  loadingStart.value = false;
}
async function markEnd() {
  loadingEnd.value = true;
  try {
    const { data } = await api.post('/attendance/end');
    message.value = `End marked, hours: ${data.attendance.hours_worked}`;
  } catch (e) { message.value = e.response?.data?.message || 'Error'; }
  loadingEnd.value = false;
}
</script>
