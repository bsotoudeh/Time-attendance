<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
    <div class="w-full max-w-md space-y-6 bg-white p-8 rounded-xl shadow">
      <h2 class="text-2xl font-semibold text-gray-900 text-center">Login</h2>
      <form @submit.prevent="onSubmit" class="space-y-5">
        <div>
          <label class="block text-left text-sm font-medium text-gray-700">Email</label>
          <input v-model="email" type="email" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 h-[40px] px-2 py-2" placeholder="you@example.com" />
        </div>
        <div>
          <label class="block text-left text-sm font-medium text-gray-700">Password</label>
          <input v-model="password" type="password" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 h-[40px] px-2 py-2" placeholder="••••••••" />
        </div>
        <button type="submit" :disabled="loading" class="w-full inline-flex justify-center items-center rounded-md bg-indigo-600 px-4 py-2 text-white font-medium hover:bg-indigo-700 disabled:opacity-50">Login</button>
        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../store/user';
import api from '../services/api';

const router = useRouter();
const userStore = useUserStore();

const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

async function onSubmit() {
  loading.value = true; error.value='';
  try {
    const { data } = await api.post('/auth/login', { email: email.value, password: password.value });
    userStore.setUser(data.user, data.token);
    router.push({ name: 'dashboard' });
  } catch (e) {
    error.value = e.response?.data?.message || 'Login failed';
  } finally {
    loading.value = false;
  }
}
</script>