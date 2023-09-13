// @ts-nocheck
sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
  ],

  /**
   * 
   * @param {typeof sap.ui.core.mvc.Controller} Controller 
   * @param {typeof sap.ui.core.routing.History} History 
   * @param {typeof sap.m.MessageBox} MessageBox 
   * @param {typeof sap.ui.model.Filter} Filter 
   * @param {typeof sap.ui.model.FilterOperator} FilterOperator 
   * @returns 
   */
  function (Controller, History, MessageBox, Filter, FilterOperator) {

    function _onObjectMatched(oEvent) {

      this.onClearSignature();

      this.getView().bindElement({
        path: "/Orders(" + oEvent.getParameter("arguments").OrderID + ")",
        model: "odataNorthwind",
        events: {
          dataReceived: function (oData) {
            _readSignature.bind(this)(oData.getParameter("data").OrderID, oData.getParameter("data").EmployeeID);
          }.bind(this)
        }
      });

      const objContext = this.getView().getModel("odataNorthwind").getContext("/Orders("
        + oEvent.getParameter("arguments").OrderID + ")").getObject();

      if (objContext) {
        _readSignature.bind(this)(objContext.OrderID, objContext.EmployeeID);
      }

    };

    /**
     * Load dependences as Signature image and Files
     * @param {*} orderId 
     * @param {*} employeeId 
     */
    function _readSignature(orderId, employeeId) {

      // Load Signature image
      this.getView().getModel("incidenceModel").read("/SignatureSet(OrderId='" + orderId
        + "',SapId='" + this.getOwnerComponent().SapId
        + "',EmployeeId='" + employeeId + "')", {
        success: function (data) {
          const signature = this.getView().byId("signature");

          if (data.MediaContent !== "") {
            signature.setSignature("data:image/png;base64," + data.MediaContent);
          }

        }.bind(this),
        error: function (data) {

        }
      });

      // Load Files - UploadCollection - Depricated
      this.byId("uploadCollection").bindAggregation("items", {
        path: "incidenceModel>/FilesSet",
        filters: [
          new Filter("OrderId", FilterOperator.EQ, orderId),
          new Filter("SapId", FilterOperator.EQ, this.getOwnerComponent().SapId),
          new Filter("EmployeeId", FilterOperator.EQ, employeeId)
        ],
        template: new sap.m.UploadCollectionItem({
          documentId: "{incidenceModel>AttId}",
          fileName: "{incidenceModel>FileName}",
          visibleEdit: false
        }).attachPress(this.downloadFile)
      });

      // Load Files - UploadSet - NEW
      var oUploadSet = this.byId("uploadSet");
      oUploadSet.bindAggregation("items", {
        path: "incidenceModel>/FilesSet",
        filters: [
          new Filter("OrderId", FilterOperator.EQ, orderId),
          new Filter("SapId", FilterOperator.EQ, this.getOwnerComponent().SapId),
          new Filter("EmployeeId", FilterOperator.EQ, employeeId)
        ],
        template: new sap.m.upload.UploadSetItem({
          fileName: "{incidenceModel>FileName}",
          mediaType: "{incidenceModel>MineType}",
          visibleEdit: false
        })
      });

    };

    return Controller.extend("employees.controller.OrderDetails", {

      onInit: function () {
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.getRoute("RouteOrderDetails").attachPatternMatched(_onObjectMatched, this);
      },

      onBack: function () {
        var oHistory = History.getInstance();
        var sPreviousHash = oHistory.getPreviousHash();

        if (sPreviousHash !== undefined) {
          window.history.go(-1);
        } else {
          var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
          oRouter.navTo("RouteMainView", true);
        }

      },

      onClearSignature: function () {
        var signature = this.byId("signature");
        signature.clear();
      },

      factoryOrderDetails: function (listId, oContext) {
        var contextObject = oContext.getObject();
        contextObject.Currency = "EUR";
        var unitsInStock = oContext.getModel().getProperty("/Products(" + contextObject.ProductID + ")/UnitsInStock");

        if (contextObject.Quantity <= unitsInStock) {
          var objectListItem = new sap.m.ObjectListItem({
            title: "{odataNorthwind>/Products(" + contextObject.ProductID + ")/ProductName} ({odataNorthwind>Quantity})",
            number: "{parts: [{path: 'odataNorthwind>UnitPrice'}, {path: 'odataNorthwind>Currency'} ], type: 'sap.ui.model.type.Currency', formatOptions: {showMeasure: false} }",
            numberUnit: "{odataNorthwind>Currency}"
          });
          return objectListItem;
        } else {
          var customListItem = new sap.m.CustomListItem({
            content: [
              new sap.m.Bar({
                contentLeft: new sap.m.Label({ text: "{odataNorthwind>/Products(" + contextObject.ProductID + ")/ProductName} ({odataNorthwind>Quantity})" }),
                contentMiddle: new sap.m.ObjectStatus({ text: "{i18n>availableStock} {odataNorthwind>/Products(" + contextObject.ProductID + ")/UnitsInStock}", state: "Error" }),
                contentRight: new sap.m.Label({ text: "{parts: [{path: 'odataNorthwind>UnitPrice'}, {path: 'odataNorthwind>Currency'} ], type: 'sap.ui.model.type.Currency'}" })
              })
            ]
          });
          return customListItem;
        }
      },

      onSaveSignature: function (oEvent) {
        const signature = this.byId("signature");
        const oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
        var signaturePng;

        if (!signature.isFill()) {
          MessageBox.warning(oResourceBundle.getText("fillSignature"));
        } else {
          signaturePng = signature.getSignature().replace("data:image/png;base64,", "");
          var objectOrder = oEvent.getSource().getBindingContext("odataNorthwind").getObject();
          var body = {
            OrderId: objectOrder.OrderID.toString(),
            SapId: this.getOwnerComponent().SapId,
            EmployeeId: objectOrder.EmployeeID.toString(),
            MimeType: "image/png",
            MediaContent: signaturePng
          };

          this.getView().getModel("incidenceModel").create("/SignatureSet", body, {
            success: function () {
              MessageBox.information(oResourceBundle.getText("signatureSaved"));
            },
            error: function () {
              MessageBox.error(oResourceBundle.getText("signatureNotSaved"));
            }
          });
        };

      },

      onFileBeforeUpload: function (oEvent) {

        var fileName = oEvent.getParameter("fileName");
        var objContext = oEvent.getSource().getBindingContext("odataNorthwind").getObject();
        var oCustomerHeaderSlug = new sap.m.UploadCollectionParameter({
          name: "slug",
          value: objContext.OrderID + ";" + this.getOwnerComponent().SapId + ";" + objContext.EmployeeID + ";" + fileName
        });

        oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);

      },

      onFileBeforeUpload_NEW: function (oEvent) {

        var oItem = oEvent.getParameter("item"),
          oModel = this.getView().getModel("incidenceModel"),
          oBindingContext = oItem.getBindingContext("odataNorthwind"),
          sOrderId = oBindingContext.getProperty("OrderID").toString(),
          sSapId = this.getOwnerComponent().SapId,
          sEmpployeeId = oBindingContext.getProperty("EmployeeID").toString(),
          sFileName = oItem.getFileName(),
          sSecurityToken = oModel.getSecurityToken();

        var sSlug = sOrderId + ";" + sSapId + ";" + sEmpployeeId + ";" + sFileName;

        var oCustomerHeaderToken = new sap.ui.core.Item({
          key: "X-CSRF-Token",
          text: sSecurityToken
        });

        var oCustomerHeaderSlug = new sap.ui.core.Item({
          key: "Slug",
          text: sSlug
        });

        oItem.addHeaderField(oCustomerHeaderToken);
        oItem.addHeaderField(oCustomerHeaderSlug);

      },

      onFileChange: function (oEvent) {

        var oUploadCollection = oEvent.getSource();
        var oCustomerHeaderToken = new sap.m.UploadCollectionParameter({
          name: "x-csrf-token",
          value: this.getView().getModel("incidenceModel").getSecurityToken()
        });

        oUploadCollection.addHeaderParameter(oCustomerHeaderToken);

      },

      onFileUploadComplete: function (oEvent) {
        oEvent.getSource().getBinding("items").refresh();
      },

      onFileUploadComplete_NEW: function (oEvent) {
        var oUploadSet = oEvent.getSource();
        oUploadSet.getBinding("items").refresh();
      },

      onFileDelete: function (oEvent) {
        var oUploadCollection = oEvent.getSource();
        var sPath = oEvent.getParameter("item").getBindingContext("incidenceModel").getPath();

        this.getView().getModel("incidenceModel").remove(sPath, {
          success: function () {
            oUploadCollection.getBinding("items").refresh();
            MessageBox.information("Archivo eliminado correctamente");
          },
          error: function () {
            MessageBox.error("Error al eliminar el archivo");
          }
        });
      },

      onFileDelete_NEW: function (oEvent) {
        var oUploadSet = oEvent.getSource();
        var sPath = oEvent.getParameter("item").getBindingContext("incidenceModel").getPath();

        this.getView().getModel("incidenceModel").remove(sPath, {
          success: function () {
            oUploadSet.getBinding("items").refresh();
            MessageBox.information("Archivo eliminado correctamente");
          }, 
          error: function () {
            MessageBox.error("Error al eliminar el archivo");
          }
        });
      },

      downloadFile: function (oEvent) {
        const sPath = oEvent.getSource().getBindingContext("incidenceModel").getPath();
        window.open("/sap/opu/odata/sap/YSAPUI5_SRV_01" + sPath + "/$value");
      }

    });
  }
);
