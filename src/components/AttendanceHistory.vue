<template>
  <div>
    <h2 class="text-2xl font-bold">Attendance History</h2>
    <table class="w-full">
      <thead>
        <tr class="bg-neutral-100">
          <th class="text-left px-3 py-2">Date</th>
          <th class="text-left px-3 py-2">Start</th>
          <th class="text-left px-3 py-2">End</th>
          <th class="text-left px-3 py-2">Hours Worked</th>
        </tr>
      </thead>
      <tbody class="border-t border-white px-3 py-2">
        <tr v-for="item in history" :key="item.id" class="border-neutral-300">
          <td class="text-left px-3 py-2">{{ item.date }}</td>
          <td class="text-left px-3 py-2">{{ item.start_time || '-' }}</td>
          <td class="text-left px-3 py-2">{{ item.end_time || '-' }}</td>
          <td class="text-left px-3 py-2">{{ item.hours_worked || '-' }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../services/api';

const history = ref([]);

onMounted(async () => {
  try {
    const res = await api.get('/attendance/history');
    history.value = res.data;
  } catch (err) {
    console.error(err);
  }
});
</script>
