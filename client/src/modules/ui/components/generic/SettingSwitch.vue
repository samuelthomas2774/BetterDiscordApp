<template>
    <div class="bd-setting-switch" :class="{'bd-disabled': disabled}">
        <div class="bd-title">
            <h3>{{setting.title || setting.text}}</h3>
            <label class="bd-switch-wrapper" @click="!disabled ? onClick(setting) : null">
                <input type="checkbox" class="bd-switch-checkbox" />
                <div class="bd-switch" :class="{'bd-checked': (setting.checked || setting.enabled)}" />
            </label>
        </div>
        <div class="bd-hint">{{setting.hint}}</div>
    </div>
</template>
<script>
    export default {
        props: ['setting', 'onClick', 'disabled']
    }
</script>