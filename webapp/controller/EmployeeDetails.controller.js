sap.ui.define([
    "employees/controller/Base.controller",
    "employees/model/formatter",
    "sap/m/MessageBox"
], function (Base, formatter, MessageBox) {
    'use strict';

    function onInit() {
        this._bus = sap.ui.getCore().getEventBus();
    };

    function onCreateIncidence() {

        /*var tableIncidence = this.getView().byId("tableIncidence");
        var newIncidence = sap.ui.xmlfragment("employees.fragment.NewIncidence", this);
        var incidenceModel = this.getView().getModel("incidenceModel");
        var odata = incidenceModel.getData();
        var index = odata.length;
        odata.push({ index: index + 1 });
        incidenceModel.refresh();
        newIncidence.bindElement("incidenceModel>/" + index);
        tableIncidence.addContent(newIncidence); */

        var tableIncidence = this.getView().byId("tableIncidence");
        var incidenceModel = this.getView().getModel("incidenceModel");
        var odata = incidenceModel.getData();
        var index = odata.length;
        odata.push({ index: index + 1, _validateDate: false, EnableSave: false });
        incidenceModel.refresh();

        this._newIncidence = sap.ui.core.Fragment.load({
            name: "employees.fragment.NewIncidence",
            controller: this
        }).then(function (oDialog) {
            return oDialog;
        });

        this._newIncidence.then(function (oDialog) {
            oDialog.bindElement("incidenceModel>/"+ index);
            tableIncidence.addContent(oDialog);
        });
            
    };

    function onDeleteIncidence(oEvent) {

        var tableIncidence = this.getView().byId("tableIncidence");
        var rowIncidence = oEvent.getSource().getParent().getParent();
        var incidenceModel = this.getView().getModel("incidenceModel");
        var odata = incidenceModel.getData();
        var contextObj = rowIncidence.getBindingContext("incidenceModel");

        odata.splice(contextObj.index - 1, 1);

        for (var i in odata) {
            odata[i].index = parseInt(i) + 1;
        };

        incidenceModel.refresh();
        tableIncidence.removeContent(rowIncidence);

        for (var j in tableIncidence.getContent()) {
            tableIncidence.getContent()[j].bindElement("incidenceModel>/" + j);
        };
    };

    function onDeleteIncidenceOData(oEvent){
        
        var contextObj = oEvent.getSource().getBindingContext("incidenceModel").getObject();
        
        MessageBox.confirm(this.getView().getModel("i18n").getResourceBundle().getText("confirmDeleteIncidence"), {
            onClose: function (oAction) {

                if (oAction === "OK") { 
                    this._bus.publish("incidence", "onDeleteIncidence", {
                        IncidenceId: contextObj.IncidenceId,
                        SapId: contextObj.SapId,
                        EmployeeId: contextObj.EmployeeId
                    });
                }
            }.bind(this)
        });

    }; 

    function onSaveIncidence(oEvent) {
        var incidence = oEvent.getSource().getParent().getParent();
        var incidenceRow = incidence.getBindingContext("incidenceModel");
        this._bus.publish("incidence", "onSaveIncidence",{incidenceRow: incidenceRow.sPath.replace('/','')});
    };

    function updateIncidenceCreationDate(oEvent) {
        let context = oEvent.getSource().getBindingContext("incidenceModel");
        let contextObj = context.getObject();

        if (oEvent.getSource().isValidValue() && oEvent.getSource().getValue()) {
            contextObj.CreationDateX = true;
            contextObj._validateDate = true;
            contextObj.CreationDateState = "None";
        } else {
            contextObj._validateDate = false;
            contextObj.CreationDateState = "Error";
        };

        if (oEvent.getSource().isValidValue() && oEvent.getSource().getValue() && contextObj.Reason) {
            contextObj.EnableSave = true;
        } else {
            contextObj.EnableSave = false;
        }

        context.getModel().refresh();
    };

    function updateIncidenceReason(oEvent) {
        let context = oEvent.getSource().getBindingContext("incidenceModel");
        let contextObj = context.getObject();

        if (oEvent.getSource().getValue()) {
            contextObj.ReasonX = true;
            contextObj.ReasonState = "None";
        } else {
            contextObj.ReasonState = "Error";
        };

        if (contextObj._validateDate && oEvent.getSource().getValue()) {
            contextObj.EnableSave = true;
        } else {
            contextObj.EnableSave = false;
        }
        
        context.getModel().refresh();
    }; 

    function updateIncidenceType(oEvent) {
        let context = oEvent.getSource().getBindingContext("incidenceModel");
        let contextObj = context.getObject();

        if (contextObj._validateDate && contextObj.Reason) {
            contextObj.EnableSave = true;
        } else {
            contextObj.EnableSave = false;
        }

        contextObj.TypeX = true;
        
        context.getModel().refresh();
    };

    var EmployeeDetails = Base.extend("employees.controller.EmployeeDetails", {});
    EmployeeDetails.prototype.onInit = onInit;
    EmployeeDetails.prototype.onCreateIncidence = onCreateIncidence;
    EmployeeDetails.prototype.onDeleteIncidence = onDeleteIncidence;
    EmployeeDetails.prototype.onDeleteIncidenceOData = onDeleteIncidenceOData;
    EmployeeDetails.prototype.Formatter = formatter;
    EmployeeDetails.prototype.onSaveIncidence = onSaveIncidence;
    EmployeeDetails.prototype.updateIncidenceCreationDate = updateIncidenceCreationDate;
    EmployeeDetails.prototype.updateIncidenceReason = updateIncidenceReason;
    EmployeeDetails.prototype.updateIncidenceType = updateIncidenceType;
    return EmployeeDetails;

});