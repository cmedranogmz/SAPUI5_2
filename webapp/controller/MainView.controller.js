// @ts-nocheck
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     * @param {typeof sap.iu.model.Filter} Filter 
     * @param {typeof sap.iu.model.FilterOperator} FilterOperator 
     */
    function (Controller, Filter, FilterOperator) {
        "use strict";

        function myCheck() {
            var inputEmployee = this.byId("inputEmployee");
            var valueEmployee = inputEmployee.getValue();

            if (valueEmployee.length === 10) {
                inputEmployee.setDescription("Ok");
            } else {
                inputEmployee.setDescription("Not ok");
            }
        }

        return Controller.extend("employees.controller.MainView", {
            onInit: function () {

                var oView = this.getView();

                //var i18nBundle = oView.getModel("i18n").getResourceBundle();

                /**var oJSON = {
                    employeeId: "12345",
                    countryKey: "UK",
                    listCountry: [
                        {
                            key: "US",
                            text: i18nBundle.getText("countryUS")
                        },
                        {
                            key: "UK",
                            text: i18nBundle.getText("countryUK")
                        },
                        {
                            key: "ES",
                            text: i18nBundle.getText("countryES")
                        }
                    ]
                };
                
                oJSONModel.setData(oJSON);**/

                var oJSONModelEmployees = new sap.ui.model.json.JSONModel();
                oJSONModelEmployees.loadData("/localService/mockdata/Employees.json", false);
                oJSONModelEmployees.attachRequestCompleted(function (oEventModel) {
                    console.log.apply(JSON.stringify(oJSONModel.getData()));
                });
                oView.setModel(oJSONModelEmployees, "jsonEmployees");

                var oJSONModelCountries = new sap.ui.model.json.JSONModel();
                oJSONModelCountries.loadData("/localService/mockdata/Countries.json", false);
                oView.setModel(oJSONModelCountries, "jsonCountries");

                var oJSONModelConfig = new sap.ui.model.json.JSONModel({
                    visibleId: true,
                    visibleName: true,
                    visibleCountry: true,
                    visibleCity: false,
                    visibleBtnShowCity: true,
                    visibleBtnHideCity: false
                });
                oView.setModel(oJSONModelConfig, "jsonConfig")

            },

            //onValidate: myCheck
            onValidate: function () {
                var inputEmployee = this.byId("inputEmployee");
                var valueEmployee = inputEmployee.getValue();

                if (valueEmployee.length === 10) {
                    inputEmployee.setDescription("Ok");
                    this.getView().byId("labelCountry").setVisible(true);
                    this.getView().byId("slCountry").setVisible(true);
                } else {
                    inputEmployee.setDescription("Not ok");
                    this.getView().byId("labelCountry").setVisible(false);
                    this.getView().byId("slCountry").setVisible(false);
                }
            },

            onFilter: function () {
                var oJSONCountries = this.getView().getModel("jsonCountries").getData();
                var filters = [];

                if (oJSONCountries.EmployeeId !== "") {
                    filters.push(new Filter("EmployeeID", FilterOperator.EQ, oJSONCountries.EmployeeId));
                }
                if (oJSONCountries.CountryKey !== "") {
                    filters.push(new Filter("Country", FilterOperator.EQ, oJSONCountries.CountryKey));
                }

                var oList = this.getView().byId("tableEmployee");
                var oBinding = oList.getBinding("items");
                oBinding.filter(filters);
            },

            onClearFilter: function () {
                var oModel = this.getView().getModel("jsonCountries");
                oModel.setProperty("/EmployeeId", "");
                oModel.setProperty("/CountryKey", "");

                var filters = [];
                var oList = this.getView().byId("tableEmployee");
                var oBinding = oList.getBinding("items");
                oBinding.filter(filters);


            },

            showPostalCode: function (oEvent) {
                var itemPressed = oEvent.getSource();
                var oContext = itemPressed.getBindingContext("jsonEmployees");
                var objectContext = oContext.getObject();
                sap.m.MessageToast.show(objectContext.PostalCode);

            },

            onShowCity: function () {
                var oJSONModelConfig = this.getView().getModel("jsonConfig");
                oJSONModelConfig.setProperty("/visibleCity", true);
                oJSONModelConfig.setProperty("/visibleBtnShowCity", false);
                oJSONModelConfig.setProperty("/visibleBtnHideCity", true);
            },

            onHideCity: function () {
                var oJSONModelConfig = this.getView().getModel("jsonConfig");
                oJSONModelConfig.setProperty("/visibleCity", false);
                oJSONModelConfig.setProperty("/visibleBtnShowCity", true);
                oJSONModelConfig.setProperty("/visibleBtnHideCity", false);
            },

            showOrders: function (oEvent) {
                var ordersTable = this.getView().byId("ordersTable");

                ordersTable.destroyItems();

                var itemPressed = oEvent.getSource();
                var oContext = itemPressed.getBindingContext("jsonEmployees");
                var objectContext = oContext.getObject();
                var orders = objectContext.Orders;

                var ordersItem = [];

                for (var i in orders) {
                    ordersItem.push(new sap.m.ColumnListItem({
                        cells: [
                            new sap.m.Label({ text: orders[i].OrderID }),
                            new sap.m.Label({ text: orders[i].Freight }),
                            new sap.m.Label({ text: orders[i].ShipAddress })
                        ]
                    }));
                }

                var newTable = new sap.m.Table({
                    width: "auto",
                    columns: [
                        new sap.m.Column({ header: new sap.m.Label({ text: "{i18n>orderID}" }) }),
                        new sap.m.Column({ header: new sap.m.Label({ text: "{i18n>freight}" }) }),
                        new sap.m.Column({ header: new sap.m.Label({ text: "{i18n>shipAddress}" }) })
                    ],
                    items: ordersItem
                }).addStyleClass("sapUiSmallMargin");

                ordersTable.addItem(newTable);

                var newTableJSON = new sap.m.Table();
                newTableJSON.setWidth("auto");
                newTableJSON.addStyleClass("sapUiSmallMargin");
                newTableJSON.addStyleClass("sapThemeDarkText")

                var columnOrderID = new sap.m.Column();
                var labelOrderID = new sap.m.Label();
                labelOrderID.bindProperty("text", "i18n>orderID");
                columnOrderID.setHeader(labelOrderID);
                newTableJSON.addColumn(columnOrderID);

                var columnFreight = new sap.m.Column();
                var labelFreight = new sap.m.Label();
                labelFreight.bindProperty("text", "i18n>freight");
                columnFreight.setHeader(labelFreight);
                newTableJSON.addColumn(columnFreight);

                var columnShipAddress = new sap.m.Column();
                var labelShipAddress = new sap.m.Label();
                labelShipAddress.bindProperty("text", "i18n>shipAddress");
                columnShipAddress.setHeader(labelShipAddress);
                newTableJSON.addColumn(columnShipAddress);

                var columListItem = new sap.m.ColumnListItem();

                var cellOrderID = new sap.m.Label();
                cellOrderID.bindProperty("text", "jsonEmployees>OrderID");
                columListItem.addCell(cellOrderID);

                var cellFreight = new sap.m.Label();
                cellFreight.bindProperty("text", "jsonEmployees>Freight");
                columListItem.addCell(cellFreight);

                var cellShipAddress = new sap.m.Label();
                cellShipAddress.bindProperty("text", "jsonEmployees>ShipAddress");
                columListItem.addCell(cellShipAddress);

                var oBindingInfo = {
                    model: "jsonEmployees",
                    path: "Orders",
                    template: columListItem
                };

                newTableJSON.bindAggregation("items", oBindingInfo);
                newTableJSON.bindElement("jsonEmployees>" + oContext.getPath());

                ordersTable.addItem(newTableJSON);

            },

            showDialogOrders: function (oEvent) {
                //get selected controller
                var iconPressed = oEvent.getSource();

                //context from the model
                var oContext = iconPressed.getBindingContext("jsonEmployees");

                if (!this._oDialogOrders) {
                    this._oDialogOrders = sap.ui.xmlfragment("employees.fragment.DialogOrders", this);
                    this.getView().addDependent(this._oDialogOrders);
                };

                this._oDialogOrders.bindElement("jsonEmployees>" + oContext.getPath());
                this._oDialogOrders.open();
            },

            onCloseOrders: function () {
                this._oDialogOrders.close();                
            }

        });
    });
