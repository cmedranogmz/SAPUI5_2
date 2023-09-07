sap.ui.define(
  [
    "sap/ui/core/mvc/Controller"
  ],
  function (BaseController) {
    "use strict";

    return BaseController.extend("employees.controller.Base", {
      onInit: function () {
      },

      viewOrderDetails: function (oEvent) {
        var orderID = oEvent.getSource().getBindingContext("odataNorthwind").getObject().OrderID;
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.navTo("RouteOrderDetails", {
          OrderID: orderID
        });
      }

    });
  }
);
