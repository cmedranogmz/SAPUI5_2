sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (Controller) {
    'use strict';

    return Controller.extend("employees.controller.Main", {

        onInit: function () {

            var oView = this.getView();

                var oJSONModelEmployees = new sap.ui.model.json.JSONModel();
                oJSONModelEmployees.loadData("/localService/mockdata/Employees.json", false);
                oJSONModelEmployees.attachRequestCompleted(function (oEventModel) {
                    console.log.apply(JSON.stringify(oJSONModelEmployees.getData()));
                });
                oView.setModel(oJSONModelEmployees, "jsonEmployees");

                var oJSONModelCountries = new sap.ui.model.json.JSONModel();
                oJSONModelCountries.loadData("/localService/mockdata/Countries.json", false);
                oView.setModel(oJSONModelCountries, "jsonCountries");

                var oJSONModelLayout = new sap.ui.model.json.JSONModel();
                oJSONModelLayout.loadData("/localService/mockdata/Layout.json", false);
                oView.setModel(oJSONModelLayout, "jsonLayout");

                var oJSONModelConfig = new sap.ui.model.json.JSONModel({
                    visibleId: true,
                    visibleName: true,
                    visibleCountry: true,
                    visibleCity: false,
                    visibleBtnShowCity: true,
                    visibleBtnHideCity: false
                });
                oView.setModel(oJSONModelConfig, "jsonConfig");

                this._bus = sap.ui.getCore().getEventBus();
                this._bus.subscribe("flexible", "showEmployee", this.showEmployeeDetails, this);

        },

        showEmployeeDetails: function(category, nameEvent, path){
            var detailView = this.getView().byId("detailsEmployeeView");
            detailView.bindElement("jsonEmployees>" + path);
            this.getView().getModel("jsonLayout").setProperty("/ActiveKey", "TwoColumnsBeginExpanded");

            var incidenceModel = new sap.ui.model.json.JSONModel([]);
            detailView.setModel(incidenceModel, "incidenceModel");
            detailView.byId("tableIncidence").removeAllContent();
        }

    });
});