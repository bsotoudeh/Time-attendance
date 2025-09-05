<template>
  <div>
    <h2 class="text-2xl font-bold">Monthly Report</h2>
    <table>
      <thead>
        <tr class="bg-neutral-100">
          <th class="text-left px-3 py-2">Employee</th>
          <th class="text-left px-3 py-2">Total Hours</th>
          <th class="text-left px-3 py-2">Discrepancies</th>
        </tr>
      </thead>
      <tbody class="border-t border-white px-3 py-2">
        <tr v-for="item in report" :key="item.employee_id" class="border-neutral-300">
          <td class="text-left px-3 py-2">{{ item.name }}</td>
          <td class="text-left px-3 py-2">{{ item.total_hours }}</td>
          <td class="text-left px-3 py-2">{{ item.discrepancy ? 'Yes' : 'No' }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../services/api';

const report = ref([]);

onMounted(async () => {
  try {
    const res = await api.get('/attendance/report/monthly');
    report.value = res.data;
  } catch (err) {
    console.error(err);
  }
});
</script>
