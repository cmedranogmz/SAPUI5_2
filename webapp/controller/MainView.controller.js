sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller) {
        "use strict";

        function myCheck(){
            var inputEmployee = this.byId("inputEmployee");
            var valueEmployee = inputEmployee.getValue();

            if(valueEmployee.length === 10){
                inputEmployee.setDescription("Ok");
            } else{
                inputEmployee.setDescription("Not ok");
            }
        }

        return Controller.extend("employees.controller.MainView", {
            onInit: function () {

            },

            //onValidate: myCheck
            onValidate: function(){
                var inputEmployee = this.byId("inputEmployee");
                var valueEmployee = inputEmployee.getValue();

                if(valueEmployee.length === 10){
                    inputEmployee.setDescription("Ok");
                    this.getView().byId("labelCountry").setVisible(true);
                    this.getView().byId("slCountry").setVisible(true);
                } else{
                    inputEmployee.setDescription("Not ok");
                    this.getView().byId("labelCountry").setVisible(false);
                    this.getView().byId("slCountry").setVisible(false);
                }
            }

        });
    });
