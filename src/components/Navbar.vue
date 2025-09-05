<template>
  <nav class="flex items-center justify-between w-full border-b px-2 py-3 border-neutral-300">
    <div>
      <router-link to="/" class="mr-2 cursor-pointer text-blue-900 font-bold hover:text-blue-700">Dashboard</router-link>
      <router-link to="/leaves" class="mr-2 cursor-pointer text-blue-900 font-bold hover:text-blue-700">Leaves</router-link>
    </div>
    <div>
      <span class="text-black font-bold ml-10 mr-2">Name:<span class="text-gray-500 font-normal ml-1">{{ user?.name }} </span>
      <span class="text-black font-bold ml-2">Role: <span class="text-gray-500 font-normal ml-1">{{ user?.role }}</span></span></span>
      <button @click="logout" class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded">Logout</button>
    </div>
  </nav>
</template>
<script setup>
import { computed } from 'vue';
import { useUserStore } from '../store/user';
import { useRouter } from 'vue-router';

const userStore = useUserStore();
const router = useRouter();
const user = computed(() => userStore.user);

function logout() {
  userStore.logout();
  router.push({ name: 'login' });
}
</script>