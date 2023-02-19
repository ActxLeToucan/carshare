<template>
    <div class="flex grow flex-col">
        <topbar></topbar>
        <div class="flex grow w-fit flex-col justify-center space-y-6 mx-auto">
            <modal :oncancel="onCancel" :onvalidate="onValidate" title="S'inscrire">
                <input-text   name="firstname"        label="Nom"          placeholder="Nom de famille"                               ></input-text>
                <input-text   name="lastname"         label="Prénom"       placeholder="Prénom"                                       ></input-text>
                <input-text   name="mail"             label="Email"        placeholder="Adresse mail"                 type="email"    ></input-text>
                <input-text   name="phone"            label="Téléphone"    placeholder="Numéro de téléphone"          type="tel"      ></input-text>
                <input-text   name="password"         label="Mot de passe" placeholder="Mot de passe"                 type="password" ></input-text>
                <input-text   name="password-confirm" label="Confirmation" placeholder="Confirmation du mot de passe" type="password" ></input-text>
                <input-switch name="is-driver"        label="J'ai une voiture"                                        value="false"   ></input-switch>
            </modal>
        </div>
    </div>
</template>

<script>
import Topbar from "../components/topbar/Topbar.vue";
import Modal from "../components/cards/Modal.vue";
import InputText from "../components/inputs/InputText.vue";
import InputSwitch from "../components/inputs/InputSwitch.vue";

function onCancel() {

}

function onValidate() {

}

export default {
    components: {
        Topbar,
        Modal,
        InputText,
        InputSwitch
    },
    name: 'Register',
    methods: {
        onCancel,
        onValidate
    },
    data() {
        return {}
    }
}
</script>