<template>
    <div class="orders">
        <Confirmation />
        <Alert />
        <div class="content">
            <div class="filter">
                <OrdersListFilterDashboard />
            </div>
            <div class="list__wrapper" v-if="showOrderList">
                <v-card class="list">
                    <v-toolbar>
                        <v-toolbar-title>Lucrari</v-toolbar-title>
                        <v-spacer></v-spacer>
                        <v-btn icon @click="showAddBar" id="plus">
                            <font-awesome-icon :icon="['fas', 'plus-circle']" />
                        </v-btn>
                        <v-btn icon @click="showSearchBar" id="search">
                            <v-icon>mdi-magnify</v-icon>
                        </v-btn>
                    </v-toolbar>
                    <template>
                        <v-data-table
                            v-model="selectedOrder"
                            :headers="headers"
                            :items="filteredOrderList"
                            item-key="id"
                            hide-default-footer
                            :single-select="singleSelect"
                            show-select
                            class="table"
                        >
                            <template v-slot:item.actions="{ item }">
                                <v-icon medium @click="deleteItem(item)">
                                    mdi-delete
                                </v-icon>
                            </template>
                        </v-data-table>
                    </template>
                </v-card>
            </div>
        </div>
    </div>
</template>

<script>
import Confirmation from "../components/Confirmation.vue";
import Alert from "../components/Alert.vue";
import OrdersListFilterDashboard from "../components/OrdersListFilterDashboard.vue";
import { mapGetters, mapActions } from "vuex";

export default {
    name: "Orders",
    components: {
        Confirmation,
        Alert,
        OrdersListFilterDashboard,
    },
    data() {
        return {
            isSearchBoardActive: false,
            isAddBoardActive: false,
            isDoctorSelected: false,
            isPatientSelected: false,
            showOrderList: false,
            singleSelect: true,
            selectedOrder: [],
            orderToDelete: "",
            alert: {
                type: "",
                message: "",
                time: 0,
            },
            headers: [
                {
                    text: "Id",
                    align: "start",
                    sortable: true,
                    value: "id",
                },
                {
                    text: "Doctor",
                    align: "start",
                    sortable: true,
                    value: "doctor_name",
                },

                {
                    text: "Patient",
                    align: "start",
                    sortable: true,
                    value: "patient_name",
                },
                {
                    text: "Actions",
                    align: "start",
                    value: "actions",
                    sortable: false,
                },
            ],
        };
    },
    created() {
        this.getData();
        this.selectedOrder = [this.getSelectedOrder];
    },

    computed: {
        ...mapGetters([
            "getSelectedPatient",
            "getSelectedDoctor",
            "getSelectedOrder",
            "filteredOrderList",
            "getConfirmationVisibleFlag",
            "getConfirmationProceedFlag",
        ]),
    },
    methods: {
        ...mapActions([
            "requestOrderList",
            "requestDoctorList",
            "requestPatientList",
            "filterOrderList",
            "addAlert",
            "addConfirmation",
            "resetConfirmation",
            "setSelectedOrder",
            "removeSelectedOrder",
            "emptyFilteredOrderList",
            "inspectToken",
            "removeOrder",
        ]),

        getData: async function() {
            await this.requestDoctorList()
                .then((response) => {
                    const status = response.status;
                    let type;
                    if (status == "200") type = "success";
                    this.alert = {
                        type: type,
                        message: "Doctors data received!",
                    };
                    this.addAlert(this.alert);
                })
                .catch((error) => {
                    this.alert = {
                        type: "error",
                        message: error,
                    };
                    this.addAlert(this.alert);
                });

            await this.requestPatientList()
                .then((response) => {
                    const status = response.status;
                    let type;
                    if (status == "200") type = "success";
                    this.newAlert = {
                        type: type,
                        message: "Patients data received!",
                    };
                    this.addAlert(this.alert);
                })
                .catch((error) => {
                    this.alert = {
                        type: "error",
                        message: error,
                    };
                    this.addAlert(this.alert);
                });
        },

        showSearchBar() {
            if (this.isSearchBoardActive === true)
                this.isSearchBoardActive = false;
            else {
                if (this.isAddBoardActive === true) {
                    this.isSearchBoardActive = true;
                    this.isAddBoardActive = false;
                } else {
                    this.isSearchBoardActive = true;
                }
            }
        },

        showAddBar() {
            if (this.isAddBoardActive === true) this.isAddBoardActive = false;
            else {
                if (this.isSearchBoardActive === true) {
                    this.isAddBoardActive = true;
                    this.isSearchBoardActive = false;
                } else {
                    this.isAddBoardActive = true;
                }
            }
        },

        editItem(item) {
            this.setSelectedOrder(item);
            this.$emit("redirectEdit");
        },

        deleteItem(item) {
            this.inspectToken();
            const message = `Are you sure you want to delete ${item.doctor_name} ${item.patient_name}?`;
            this.addConfirmation(message);
            this.orderToDelete = item;
        },

        proceedDeleteItem(item) {
            console.log("da");
            this.removeOrder({ orderId: item.id })
                .then((response) => {
                    const status = response.status;
                    let type;
                    if (status == "204") type = "success";
                    this.alert = {
                        type: type,
                        message: "Order removed!",
                    };
                    this.addAlert(this.alert);
                })
                .catch((error) => {
                    this.alert = {
                        type: "error",
                        message: error,
                    };
                    this.addAlert(this.alert);
                });
            this.resetConfirmation();
            this.orderToDelete = "";
        },
    },
    watch: {
        getSelectedDoctor: function() {
            if (this.getSelectedDoctor != "") {
                this.isDoctorSelected = true;
                const payload = {
                    doctorId: this.getSelectedDoctor.id,
                    patientId:
                        this.getSelectedDoctor !== ""
                            ? this.getSelectedPatient.id
                            : "",
                };
                this.filterOrderList(payload);
            } else {
                this.isDoctorSelected = false;
                if (this.isPatientSelected === false) {
                    this.emptyFilteredOrderList();
                }
            }
        },

        getSelectedPatient: function() {
            if (this.getSelectedPatient != "") {
                this.isPatientSelected = true;
                const payload = {
                    doctorId:
                        this.getSelectedDoctor !== ""
                            ? this.getSelectedDoctor.id
                            : "",
                    patientId: this.getSelectedPatient.id,
                };
                this.filterOrderList(payload);
            } else {
                this.isPatientSelected = false;
                if (this.isDoctorSelected === false) {
                    this.emptyFilteredOrderList();
                }
            }
        },

        isPatientSelected: function() {
            if (
                this.isPatientSelected === false &&
                this.isDoctorSelected === false
            )
                this.showOrderList = false;
            else this.showOrderList = true;
        },

        isDoctorSelected: function() {
            if (
                this.isDoctorSelected === false &&
                this.isDoctorSelected === false
            )
                this.showOrderList = false;
            else this.showOrderList = true;
        },

        selectedOrder: function() {
            if (this.selectedOrder.length != 0)
                this.setSelectedOrder(this.selectedOrder[0]);
            else this.removeSelectedOrder();
        },

        getConfirmationProceedFlag: function() {
            if (this.getConfirmationProceedFlag === true)
                this.proceedDeleteItem(this.orderToDelete);
        },
    },
};
</script>

<style scoped>
.filter {
    width: 100%;
}

.content {
    position: relative;
    min-height: fit-content;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
}

.list__wrapper {
    width: 100%;
    min-height: 100%;
}

.list {
    min-height: 100%;
    text-align: center;
}

.table {
    text-align: left;
}
</style>