<template>
  <div class="min-h-screen bg-gray-50">
    <Navbar />
    <div class="max-w-6xl mx-auto p-6">
      <h2 class="text-2xl font-semibold text-gray-900 mb-6">Leave Requests</h2>

      <form @submit.prevent="create" class="bg-white rounded-xl shadow p-6 mb-8">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Start</label>
            <input type="date" v-model="start" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">End</label>
            <input type="date" v-model="end" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Type</label>
            <select v-model="type" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
              <option value="paid">Paid</option>
              <option value="sick">Sick</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Remarks</label>
            <input placeholder="Optional" v-model="remarks" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
          </div>
        </div>
        <div class="mt-6">
          <button :disabled="posting" class="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-white font-medium hover:bg-indigo-700 disabled:opacity-50">Request</button>
        </div>
      </form>

      <div class="bg-white rounded-xl shadow overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remarks</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="r in rows" :key="r.id" class="hover:bg-gray-50">
              <td class="px-4 py-3">{{ r.id }}</td>
              <td class="px-4 py-3">{{ r.name }}</td>
              <td class="px-4 py-3">{{ r.start_date }}</td>
              <td class="px-4 py-3">{{ r.end_date }}</td>
              <td class="px-4 py-3">{{ r.leave_type }}</td>
              <td class="px-4 py-3">{{ r.status }}</td>
              <td class="px-4 py-3">{{ r.remarks || '-' }}</td>
              <td class="px-4 py-3">
                <template v-if="canDecide">
                  <button @click="decide(r.id, 'approved')" class="mr-2 inline-flex items-center rounded-md bg-emerald-600 px-3 py-1.5 text-white text-sm hover:bg-emerald-700">Approve</button>
                  <button @click="decide(r.id, 'partially_approved')" class="mr-2 inline-flex items-center rounded-md bg-amber-600 px-3 py-1.5 text-white text-sm hover:bg-amber-700">Partial</button>
                  <button @click="decide(r.id, 'rejected')" class="inline-flex items-center rounded-md bg-rose-600 px-3 py-1.5 text-white text-sm hover:bg-rose-700">Reject</button>
                </template>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import Navbar from '../components/Navbar.vue';
import api from '../services/api';
import { useUserStore } from '../store/user';

const userStore = useUserStore();
const rows = ref([]);
const start = ref('');
const end = ref('');
const type = ref('paid');
const remarks = ref('');
const posting = ref(false);
const canDecide = computed(() => ['manager','hr'].includes(userStore.user?.role));

async function load() {
  const { data } = await api.get('/leaves');
  rows.value = data;
}

async function create() {
  posting.value = true;
  try {
    await api.post('/leaves', {
      start_date: start.value, end_date: end.value, leave_type: type.value, remarks: remarks.value
    });
    start.value=''; end.value=''; remarks.value=''; type.value='paid';
    await load();
  } finally {
    posting.value = false;
  }
}

async function decide(id, status) {
  await api.post(`/leaves/${id}/decision`, { status });
  await load();
}

onMounted(load);
</script>