<template>
    <div class="flex grow h-fit w-full md:flex-row flex-col justify-between md:space-x-8 md:items-center my-2">
        <label class="flex text-xl text-slate-500 font-bold whitespace-nowrap text-ellipsis w-fit">
            {{ label }}
        </label>
        <input
            class="flex h-fit bg-white border-b-4 border-slate-200 rounded-md px-4 py-2 text-gray-700 font-bold text-lg whitespace-nowrap
                   text-slate-600 text-ellipsis hover:border-slate-300 focus:border-teal-500 transition-all focus:outline outline-transparent"
            :placeholder="placeholder"
            :type="type"
            :name="name"
            :value="value"
        >
    </div>
</template>

<script>
export default {
    name: '',
    props: {
        label: {
            type: String,
            default: '',
            required: false
        },
        placeholder: {
            type: String,
            default: '',
            required: false
        },
        value: {
            type: String,
            default: '',
            required: false
        },
        name: {
            type: String,
            default: '',
            required: false
        },
        type: {
            type: String,
            default: 'text',
            required: false
        }
    },
    data() {
        return {}
    }
}
</script>