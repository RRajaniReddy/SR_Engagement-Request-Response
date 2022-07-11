sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"../model/formatter",
    "sap/m/library",
     "sap/m/MessageBox"
], function (BaseController, JSONModel, formatter, mobileLibrary) {
	"use strict";

	// shortcut for sap.m.URLHelper
	var URLHelper = mobileLibrary.URLHelper;

	return BaseController.extend("ns.supplierdash.controller.Detail", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		onInit : function () {
			// Model used to manipulate control states. The chosen values make sure,
			// detail page is busy indication immediately so there is no break in
            // between the busy indication for loading the view's meta data
            this.oDataModel = this.getOwnerComponent().getModel();
			var oViewModel = new JSONModel({
				busy : false,
				delay : 0,
				lineItemListTitle : this.getResourceBundle().getText("detailLineItemTableHeading")
			});

			this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);

			this.setModel(oViewModel, "detailView");

			this.getOwnerComponent().getModel().metadataLoaded().then(this._onMetadataLoaded.bind(this));
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Event handler when the share by E-Mail button has been clicked
		 * @public
		 */
		onSendEmailPress : function () {
			var oViewModel = this.getModel("detailView");

			URLHelper.triggerEmail(
				null,
				oViewModel.getProperty("/shareSendEmailSubject"),
				oViewModel.getProperty("/shareSendEmailMessage")
			);
		},


		/**
		 * Updates the item count within the line item table's header
		 * @param {object} oEvent an event containing the total number of items in the list
		 * @private
		 */
		onListUpdateFinished : function (oEvent) {
			var sTitle,
				iTotalItems = oEvent.getParameter("total"),
				oViewModel = this.getModel("detailView");

			// only update the counter if the length is final
			if (this.byId("lineItemsList").getBinding("items").isLengthFinal()) {
				if (iTotalItems) {
					sTitle = this.getResourceBundle().getText("detailLineItemTableHeadingCount", [iTotalItems]);
				} else {
					//Display 'Line Items' instead of 'Line items (0)'
					sTitle = this.getResourceBundle().getText("detailLineItemTableHeading");
				}
				oViewModel.setProperty("/lineItemListTitle", sTitle);
			}
		},

		/* =========================================================== */
		/* begin: internal methods                                     */
		/* =========================================================== */

		/**
		 * Binds the view to the object path and expands the aggregated line items.
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
		 * @private
		 */
		_onObjectMatched : function (oEvent) {
            debugger;
			var sObjectId =  oEvent.getParameter("arguments").objectId;
			this.getModel("appView").setProperty("/layout", "TwoColumnsMidExpanded");
			this.getModel().metadataLoaded().then( function() {
				var sObjectPath = this.getModel().createKey("AssessmentRequests", {
					ID :  sObjectId
				});
				this._bindView("/" + sObjectPath);
            }.bind(this));
            this.objectData = sap.ui.getCore().getModel("oDDOTable").getData();
            this.getView().byId("oCommodity").setText(this.objectData.Commodity);
            this.getView().byId("oRegion").setText(this.objectData.Region);
            this.getView().byId("oDepartment").setText(this.objectData.DepartmentID);
            this.getView().byId("oQuestID").setText(this.objectData.QuestionnaireID);
             if(this.objectData.Status==="OpenWithApprover"){
                this.getView().byId("oSave").setVisible(false);
                this.getView().byId("oSubmit").setVisible(false);
            }else{
                this.getView().byId("oSave").setVisible(true);
                this.getView().byId("oSubmit").setVisible(true);
            }
            var TodayDate = this.objectData.TodayDate;
            var Date = this.objectData.Date;
            this._RemDays(Date,TodayDate);
        },
        _RemDays : function(Date,TodayDate){
            // debugger;
            // var that = this; 
            // var date1 = TodayDate;
            // var date2 = Date;
            // var diffTime = Math.abs(date2 - date1);
            // var diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
            // var x = (diffTime + " milliseconds");
            // var y = (diffDays + " days");
            // this.getView().byId("oDays").setText(y);
            var that = this; 
            var date1 = TodayDate;
            var date2 = Date;
            if(date1 < date2){
             var diffTime = Math.abs(date2 - date1);
             var diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
             var x = (diffTime + " milliseconds");
             var y = (diffDays + " days");
             this.getView().byId("oDays").setText(y);
              this.getView().byId("oSave").setVisible(true);
              this.getView().byId("oSubmit").setVisible(true);
            }else{
             
             var y = "Overdue"    
             this.getView().byId("oDays").setText(y);
              this.getView().byId("oSave").setVisible(false);
              this.getView().byId("oSubmit").setVisible(false)
            }
          },
        _GetQuestion : function(oEvent){
            var that = this;
            var oView = this.getView().byId("oAnsForm");
            oView.removeAllContent();
			var oQuestionnaireID = this.getView().byId("oQuestID").getText();
			var oCommodity = this.getView().byId("oCommodity").getText();
			var oRegion   = this.getView().byId("oRegion").getText();
            var oDepartment = this.getView().byId("oDepartment").getText();
            var sPath = "/AssessmentQuestionnaireTable";
            var FilterValues = new Array();
            var oQueID = new sap.ui.model.Filter({
              path: "QuestionnaireID",
              operator: sap.ui.model.FilterOperator.EQ,
              value1: oQuestionnaireID
            });
            FilterValues.push(oQueID);
             var oComdi = new sap.ui.model.Filter({
              path: "Commodity_UniqueName",
              operator: sap.ui.model.FilterOperator.EQ,
              value1: oCommodity
            });
            FilterValues.push(oComdi);
             var oReg = new sap.ui.model.Filter({
              path: "Region_Region",
              operator: sap.ui.model.FilterOperator.EQ,
              value1: oRegion
            });
            FilterValues.push(oReg);
             var oDept = new sap.ui.model.Filter({
              path: "Department_DepartmentID",
              operator: sap.ui.model.FilterOperator.EQ,
              value1: oDepartment
            });
            FilterValues.push(oDept);
            var oBusy = new sap.m.BusyDialog();
            oBusy.open();
			this.oDataModel.read(sPath, {
                 filters: FilterValues,
				success: function (oData) {
                    oBusy.close();
					var self= that;
                     var oSelPO = oData.results;
                     var oView = self.getView().byId("oAnsForm");
                     self.GlobalFormElements = [];
                     self.Qid= [];
                     for(var i = 0; i < oSelPO.length; i++){
                         var oAnsId= oSelPO[i].AnswerID_AnswerID;
                         var oQuest = oSelPO[i].Questions
                         if(oAnsId === "1"){
                            // var HBox = new sap.m.HBox();
                            var oLabel = new sap.m.Label({ text:oQuest});
                            var oSngleInput = new sap.m.Input({type: sap.m.InputType.Text, value:""});
                            oView.addContent(oLabel);
                            oView.addContent(oSngleInput);
                            self.GlobalFormElements.push(oAnsId);
                            var oQId = oSelPO[i].QuestionID;
                            self.Qid.push(oQId);
                         }  
                         if(oAnsId === "2"){
                         	var oLabel = new sap.m.Label({ text:oQuest});
                            var oSngleInput = new sap.m.TextArea({value:""});
                            oView.addContent(oLabel);
                            oView.addContent(oSngleInput);
                            self.GlobalFormElements.push(oAnsId);
                            var oQId = oSelPO[i].QuestionID;
                            self.Qid.push(oQId);
                         }
                    
                         if(oAnsId === "3"){
                         	var oLabel = new sap.m.Label({ text:oQuest});
                            var oSngleInput = new sap.m.Input({type: sap.m.InputType.Date, value:""});
                            oView.addContent(oLabel);
                            oView.addContent(oSngleInput);
                            self.GlobalFormElements.push(oAnsId);
                            var oQId = oSelPO[i].QuestionID;
                            self.Qid.push(oQId);
                         }
                          if(oAnsId === "4"){
                         	var oLabel = new sap.m.Label({ text:oQuest});
                            var oSngleInput = new sap.m.Input({type: sap.m.InputType.Number, value:"",
                            liveChange:function(oEvent){
                                   
                                     var _oInput = oEvent.getSource();
                                     var val = _oInput.getValue();
                                     val = val.replace(/[^\d]/g, '');
                                    _oInput.setValue(val);
                                 
                                }
                        });
                            oView.addContent(oLabel);
                            oView.addContent(oSngleInput);
                            self.GlobalFormElements.push(oAnsId);
                            var oQId = oSelPO[i].QuestionID;
                            self.Qid.push(oQId);
                         } 
                         if(oAnsId === "5"){
                         	var oLabel = new sap.m.Label({ text:oQuest});
                            var oSngleInput = new sap.m.Input({type: sap.m.InputType.Float,
                                liveChange:function(oEvent){
                                   var _oInput = oEvent.getSource();
                                     var val =parseInt(_oInput.getValue());
                                       var oValue = val.toFixed(2);                               
                                    _oInput.setValue(oValue);
                                 
                                }
                           });
                            oView.addContent(oLabel);
                            oView.addContent(oSngleInput);
                            self.GlobalFormElements.push(oAnsId);
                            var oQId = oSelPO[i].QuestionID;
                            self.Qid.push(oQId);
                         } 
                        
                         
                         if(oAnsId === "7"){
                         	var oLabel = new sap.m.Label({ text:oQuest});
                            var oSngleInput = new sap.m.Switch({customTextOn:"Yes" ,customTextOff:"No",value:""});
                            oView.addContent(oLabel);
                            oView.addContent(oSngleInput);
                            self.GlobalFormElements.push(oAnsId);
                            var oQId = oSelPO[i].QuestionID;
                            self.Qid.push(oQId);
                         } 
                         if(oAnsId === "8"){
                         	var oLabel = new sap.m.Label({ text:oQuest});
                            // var oSngleInput = new sap.m.ComboBox({value:""});
                            var SingleInput = new sap.m.ComboBox({
                            items : {
                                path : "questionnaireModel>/Data",
                                template : new sap.ui.core.Item({
                                    key : "{questionnaireModel>QuestionnaireID}",
                                    text : "{questionnaireModel>QuestionnaireID}"
                                })
                            }
                        });
                            oView.addContent(oLabel);
                            oView.addContent(SingleInput);
                            self.GlobalFormElements.push(oAnsId);
                            var oQId = oSelPO[i].QuestionID;
                            self.Qid.push(oQId);
                            self._oSinglepicklist(oQId);
                         }
                         if(oAnsId === "9"){
                         	var oLabel = new sap.m.Label({ text:oQuest});
                            // var oSngleInput = new sap.m.MultiComboBox("oMultiList",{value:"",});
                          
                          
                            // var oSngleInput = new sap.m.MultiComboBox("abcd",{
                            //     placeholder : "I am",
                            //     items : "{PoModel1>/options}",
                            //     items : [
                            //         new sap.ui.core.Item({
                            //             key : "{PoModel1>optionkey}",
                            //             text : "{PoModel1>optionkey}"
                            //         })
                            //     ]
                            // });
                         var multiInput = new sap.m.MultiComboBox({
                            items : {
                                path : "questionnaireModel>/Data",
                                template : new sap.ui.core.Item({
                                    key : "{questionnaireModel>QuestionnaireID}",
                                    text : "{questionnaireModel>QuestionnaireID}"
                                })
                            }
                        });
                            oView.addContent(oLabel);
                            oView.addContent(multiInput);
                            self.GlobalFormElements.push(oAnsId);
                            var oQId = oSelPO[i].QuestionID;
                            self.Qid.push(oQId);
                            self._oMultipicklist(oQId);
                         }
                         
                         
                     }

  
                    self._oGetsaveData();

                    
				
				},
				error: function (Error) {
                    oBusy.close();
                    var error = Error;
                   
				}
			});
        },
        _oGetsaveData : function () {
            var that = this;
            var oProjId = parseInt(this.getView().byId("oProjectId").getText());
            var sPath = "/ResponseDetails";
            var FilterValues = new Array();
            var Pro = new sap.ui.model.Filter({
              path: "ProjectID",
              operator: sap.ui.model.FilterOperator.EQ,
              value1: oProjId
            });
            FilterValues.push(Pro);
                var oBusy = new sap.m.BusyDialog();
            oBusy.open();
			this.oDataModel.read(sPath, {
                 filters: FilterValues,
				success: function (oData) {
                oBusy.close();
				var self= that;
                var Data = oData.results;
                if(Data.length!= 0){
                    self._SaveData(Data);
               }  

                // self._SaveData(Data);
                },
				error: function (Error) {
                    oBusy.close();
                    var error = Error;
                   
				}
			});
        },
     _SaveData : function(Data){
         var that = this;
            var self = that;
                     var oSelPO = Data;
                     var oView = self.getView().byId("oAnsForm");
                     oView.removeAllContent();
                     self.GlobalFormElements = [];
                     self.Qid= [];
                     for(var i = 0; i < oSelPO.length; i++){
                        var oAnsId= oSelPO[i].AnswerID;
                        var oQuest = oSelPO[i].Question;
                         var oAns = oSelPO[i].Response;
                         if(oAnsId === "1"){
                            // var HBox = new sap.m.HBox();
                            var oLabel = new sap.m.Label({ text:oQuest});
                            var oSngleInput = new sap.m.Input({type: sap.m.InputType.Text, value:oAns});
                            oView.addContent(oLabel);
                            oView.addContent(oSngleInput);
                            self.GlobalFormElements.push(oAnsId);
                            var oQId = oSelPO[i].QuestionID;
                            self.Qid.push(oQId);
                         }  
                         if(oAnsId === "2"){
                         	var oLabel = new sap.m.Label({ text:oQuest});
                            var oSngleInput = new sap.m.TextArea({value:oAns});
                            oView.addContent(oLabel);
                            oView.addContent(oSngleInput);
                            self.GlobalFormElements.push(oAnsId);
                            var oQId = oSelPO[i].QuestionID;
                            self.Qid.push(oQId);
                         }
                    
                         if(oAnsId === "3"){
                         	var oLabel = new sap.m.Label({ text:oQuest});
                            var oSngleInput = new sap.m.Input({type: sap.m.InputType.Date, value:oAns});
                            oView.addContent(oLabel);
                            oView.addContent(oSngleInput);
                            self.GlobalFormElements.push(oAnsId);
                            var oQId = oSelPO[i].QuestionID;
                            self.Qid.push(oQId);
                         }
                          if(oAnsId === "4"){
                         	var oLabel = new sap.m.Label({ text:oQuest});
                            var oSngleInput = new sap.m.Input({type: sap.m.InputType.Number, value:oAns,
                            liveChange:function(oEvent){
                                   
                                     var _oInput = oEvent.getSource();
                                     var val = _oInput.getValue();
                                     val = val.replace(/[^\d]/g, '');
                                    _oInput.setValue(val);
                                 
                                }
                        });
                            oView.addContent(oLabel);
                            oView.addContent(oSngleInput);
                            self.GlobalFormElements.push(oAnsId);
                            var oQId = oSelPO[i].QuestionID;
                            self.Qid.push(oQId);
                         } 
                         if(oAnsId === "5"){
                         	var oLabel = new sap.m.Label({ text:oQuest});
                            var oSngleInput = new sap.m.Input({type: sap.m.InputType.Float,value:oAns,
                                liveChange:function(oEvent){
                                   var _oInput = oEvent.getSource();
                                     var val =parseInt(_oInput.getValue());
                                       var oValue = val.toFixed(2);                               
                                    _oInput.setValue(oValue);
                                 
                                }
                           });
                            oView.addContent(oLabel);
                            oView.addContent(oSngleInput);
                            self.GlobalFormElements.push(oAnsId);
                            var oQId = oSelPO[i].QuestionID;
                            self.Qid.push(oQId);
                         } 
                        
                         
                         if(oAnsId === "7"){
                         	var oLabel = new sap.m.Label({ text:oQuest});
                            var oSngleInput = new sap.m.Switch({customTextOn:"Yes" ,customTextOff:"No"}); 
                            if(oAns == 'Yes'){
                                oSngleInput.setState(true);
                            }               else{
                                oSngleInput.setState(false);
                            }                                                         
                            // var oSngleInput = new sap.m.Switch({customTextOn:"Yes" ,customTextOff:"No",state="{ path: 'oAns', type: 'sap.ui.model.type.String', formatter :'.formatter.getBooleanValue'}"});
                            oView.addContent(oLabel);
                            oView.addContent(oSngleInput);
                            self.GlobalFormElements.push(oAnsId);
                            var oQId = oSelPO[i].QuestionID;
                            self.Qid.push(oQId);
                         } 
                         if(oAnsId === "8"){
                         	var oLabel = new sap.m.Label({ text:oQuest});
                            // var oSngleInput = new sap.m.ComboBox({value:""});
                            var SingleInput = new sap.m.ComboBox({ value:oAns,
                            items : {
                                path : "questionnaireModel>/Data",
                                template : new sap.ui.core.Item({
                                    key : "{questionnaireModel>QuestionnaireID}",
                                    text : "{questionnaireModel>QuestionnaireID}"
                                })
                            }
                        });
                            oView.addContent(oLabel);
                            oView.addContent(SingleInput);
                            self.GlobalFormElements.push(oAnsId);
                            var oQId = oSelPO[i].QuestionID;
                            self.Qid.push(oQId);
                            self._oSinglepicklist(oQId);
                         }
                         if(oAnsId === "9"){
                         	var oLabel = new sap.m.Label({ text:oQuest});
                           
                         var multiInput = new sap.m.MultiComboBox({value:oAns,
                            items : {
                                path : "questionnaireModel>/Data",
                                template : new sap.ui.core.Item({
                                    key : "{questionnaireModel>QuestionnaireID}",
                                    text : "{questionnaireModel>QuestionnaireID}"
                                })
                            }
                        });
                            oView.addContent(oLabel);
                            oView.addContent(multiInput);
                            self.GlobalFormElements.push(oAnsId);
                            var oQId = oSelPO[i].QuestionID;
                            self.Qid.push(oQId);
                            self._oMultipicklist(oQId);
                         }
                         
                         
                     }

	
			
        },
        _oSinglepicklist:function(oQId){
            var that = this;
            var Questionc= oQId;
            var oQuestionnaireID = this.getView().byId("oQuestID").getText();
            var sPath = "/CustomSelectAnswers";
            var FilterValues = new Array();
             var Que = new sap.ui.model.Filter({
              path: "QuestionID",
              operator: sap.ui.model.FilterOperator.EQ,
              value1: Questionc
            });
            FilterValues.push(Que);
             var oQuestionnaire = new sap.ui.model.Filter({
              path: "QuestionnaireID",
              operator: sap.ui.model.FilterOperator.EQ,
              value1: oQuestionnaireID
            });
            FilterValues.push(oQuestionnaire);
            var oBusy = new sap.m.BusyDialog();
            oBusy.open();
			this.oDataModel.read(sPath, {
                 filters: FilterValues,
				success: function (oData) {
                      oBusy.close();
					var self= that;
               var oSelPO = oData.results;   
               if(oSelPO.length != 0){
               var osplit = oSelPO[0].Answer.split(",");
               var singlepicklist = [];
                for(var i = 0; i < osplit.length; i++){
                 var Data = {
                        }
                      Data.QuestionnaireID =osplit[i];
                      singlepicklist.push(Data);
                    }
                var questionnaireModel = new JSONModel();
                var questionnaireArray = {
                "Data" : singlepicklist
                }
               questionnaireModel.setData(questionnaireArray);
                self.getView().setModel(questionnaireModel, "questionnaireModel");
               }
                },
				error: function (Error) {
                    oBusy.close();
                    var error = Error;
                   
				}
			});
        },
        _oMultipicklist: function(oQId){
            var that = this;
            var Questionc= oQId;
            var oQuestionnaireID = this.getView().byId("oQuestID").getText();
            var sPath = "/CustomSelectAnswers";
            var FilterValues = new Array();
             var Que = new sap.ui.model.Filter({
              path: "QuestionID",
              operator: sap.ui.model.FilterOperator.EQ,
              value1: Questionc
            });
            FilterValues.push(Que);
             var oQuestionnaire = new sap.ui.model.Filter({
              path: "QuestionnaireID",
              operator: sap.ui.model.FilterOperator.EQ,
              value1: oQuestionnaireID
            });
            FilterValues.push(oQuestionnaire);
            var oBusy = new sap.m.BusyDialog();
            oBusy.open();
			this.oDataModel.read(sPath, {
                 filters: FilterValues,
				success: function (oData) {
                      oBusy.close();
					var self= that;
               var oSelPO = oData.results;   
               if(oSelPO.length != 0){
               var osplit = oSelPO[0].Answer.split(",");
               var Multipicklist = [];
                for(var i = 0; i < osplit.length; i++){
                 var Data = {
                        }
                      Data.QuestionnaireID =osplit[i];
                      Multipicklist.push(Data);
                    }


                var questionnaireModel = new JSONModel();
                var questionnaireArray = {
                "Data" : Multipicklist
                }
               questionnaireModel.setData(questionnaireArray);
                self.getView().setModel(questionnaireModel, "questionnaireModel");
              }
                },
				error: function (Error) {
                    oBusy.close();
                    var error = Error;
                   
				}
			});
        },
        

       oSubmitRequest : function(oEvent){
         var that = this;
         var obj = {}; 
         var oQuestionnaireID = this.getView().byId("oQuestID").getText();
         this.ProjectId = parseInt(this.getView().byId("oProjectId").getText());
         var oPrjId = parseInt(this.getView().byId("oProjectId").getText());
         var oPrjTitle = this.getView().byId("oProTitle").getText();
         var oForm = this.getView().byId("oAnsForm");
         
           var oDataFinalpaylpad = [];
          
         var j = 0;
        for(var i = 0; i < this.GlobalFormElements.length; i++){
        var oPayload = {
         }

         if(this.GlobalFormElements[i] === "1"){
          var oValue1 = oForm.getContent()[i+j].getText();
            j++;
         var oValue2 = oForm.getContent()[i+j].getValue();
          oPayload.QuestionID = this.Qid[i];
          oPayload.Question = oValue1 ; 
          oPayload.Response = oValue2 ;
          oPayload.QuestionnaireID = oQuestionnaireID;
          oPayload.AnswerID = this.GlobalFormElements[i];
          oPayload.ProjectID = oPrjId;
          oPayload.ProjectTitle = oPrjTitle;
          if(oPayload.Response===""){
              sap.m.MessageBox.show("Please fill all Answer type", sap.m.MessageBox.Icon.Warning, "Warning");
              return;
          }  
          oDataFinalpaylpad.push(oPayload);
          

        } else if(this.GlobalFormElements[i] === "2"){
          var oValue1 = oForm.getContent()[i+j].getText();
            j++;
          var oValue2 = oForm.getContent()[i+j].getValue();
          oPayload.QuestionID = this.Qid[i];
          oPayload.Question = oValue1 ; 
          oPayload.Response = oValue2 ;
          oPayload.QuestionnaireID = oQuestionnaireID;
          oPayload.AnswerID = this.GlobalFormElements[i];
          oPayload.ProjectID = oPrjId;
          oPayload.ProjectTitle = oPrjTitle;
          if(oPayload.Response===""){
              sap.m.MessageBox.show("Please fill all Answer type", sap.m.MessageBox.Icon.Warning, "Warning");
              return;
          }  
            oDataFinalpaylpad.push(oPayload);
        
        } else if(this.GlobalFormElements[i] === "3"){
         var oValue1 = oForm.getContent()[i+j].getText();
            j++;
          var oValue2 = oForm.getContent()[i+j].getValue();
          oPayload.QuestionID = this.Qid[i];
          oPayload.Question = oValue1 ; 
          oPayload.Response = oValue2 ;
          oPayload.QuestionnaireID = oQuestionnaireID;
          oPayload.AnswerID = this.GlobalFormElements[i];
          oPayload.ProjectID = oPrjId;
          oPayload.ProjectTitle = oPrjTitle;
           if(oPayload.Response===""){
              sap.m.MessageBox.show("Please fill all Answer type", sap.m.MessageBox.Icon.Warning, "Warning");
              return;
          }  
            oDataFinalpaylpad.push(oPayload);

        } else if(this.GlobalFormElements[i] === "4"){
        
          var oValue1 = oForm.getContent()[i+j].getText();
            j++;
          var oValue2 = oForm.getContent()[i+j].getValue();
          oPayload.QuestionID = this.Qid[i];
          oPayload.Question = oValue1 ; 
          oPayload.Response = oValue2 ;
          oPayload.QuestionnaireID = oQuestionnaireID;
          oPayload.AnswerID = this.GlobalFormElements[i];
          oPayload.ProjectID = oPrjId;
          oPayload.ProjectTitle = oPrjTitle;
           if(oPayload.Response===""){
              sap.m.MessageBox.show("Please fill all Answer type", sap.m.MessageBox.Icon.Warning, "Warning");
              return;
          }  
            oDataFinalpaylpad.push(oPayload);
        }
          else if(this.GlobalFormElements[i] === "5"){
          
          var oValue1 = oForm.getContent()[i+j].getText();
            j++;
          var oValue2 = oForm.getContent()[i+j].getValue();
          oPayload.QuestionID = this.Qid[i];
          oPayload.Question = oValue1 ; 
          oPayload.Response = oValue2 ;
          oPayload.QuestionnaireID = oQuestionnaireID;
          oPayload.AnswerID = this.GlobalFormElements[i];
          oPayload.ProjectID = oPrjId;
          oPayload.ProjectTitle = oPrjTitle;
           if(oPayload.Response===""){
              sap.m.MessageBox.show("Please fill all Answer type", sap.m.MessageBox.Icon.Warning, "Warning");
              return;
          }  
            oDataFinalpaylpad.push(oPayload);

        }
          else if(this.GlobalFormElements[i] === "7"){
        
          var oValue1 = oForm.getContent()[i+j].getText();
            j++;
          var oValue2 = oForm.getContent()[i+j].getCustomTextOn();
          oPayload.QuestionID = this.Qid[i];
          oPayload.Question = oValue1 ; 
          oPayload.Response = oValue2 ;
          oPayload.QuestionnaireID = oQuestionnaireID;
          oPayload.AnswerID = this.GlobalFormElements[i];
          oPayload.ProjectID = oPrjId;
          oPayload.ProjectTitle = oPrjTitle;
           if(oPayload.Response===""){
              sap.m.MessageBox.show("Please fill all Answer type", sap.m.MessageBox.Icon.Warning, "Warning");
              return;
          }  
            oDataFinalpaylpad.push(oPayload);
        }
         else if(this.GlobalFormElements[i] === "7"){
        
          var oValue1 = oForm.getContent()[i+j].getText();
            j++;
          var oValue2 = oForm.getContent()[i+j].getCustomTextOn();
          oPayload.QuestionID = this.Qid[i];
          oPayload.Question = oValue1 ; 
          oPayload.Response = oValue2 ;
          oPayload.QuestionnaireID = oQuestionnaireID;
          oPayload.AnswerID = this.GlobalFormElements[i];
          oPayload.ProjectID = oPrjId;
          oPayload.ProjectTitle = oPrjTitle;
           if(oPayload.Response===""){
              sap.m.MessageBox.show("Please fill all Answer type", sap.m.MessageBox.Icon.Warning, "Warning");
              return;
          }  
            oDataFinalpaylpad.push(oPayload);
        }
        else if(this.GlobalFormElements[i] === "8"){
        
          var oValue1 = oForm.getContent()[i+j].getText();
            j++;
          var oValue2 = oForm.getContent()[i+j].mProperties.value;
          oPayload.QuestionID = this.Qid[i];
          oPayload.Question = oValue1 ; 
          oPayload.Response = oValue2 ;
          oPayload.QuestionnaireID = oQuestionnaireID;
          oPayload.AnswerID = this.GlobalFormElements[i];
          oPayload.ProjectID = oPrjId;
          oPayload.ProjectTitle = oPrjTitle;
           if(oPayload.Response===""){
              sap.m.MessageBox.show("Please fill all Answer type", sap.m.MessageBox.Icon.Warning, "Warning");
              return;
          }  
            oDataFinalpaylpad.push(oPayload);
        }
        else if(this.GlobalFormElements[i] === "9"){
        
          var oValue1 = oForm.getContent()[i+j].getText();
            j++;
           var selectedItems = oForm.getContent()[i+j].mProperties.selectedKeys;
         	var messageText =  "[";
 
			for (var a = 0; a < selectedItems.length; a++) {
				messageText += "'" + selectedItems[a] + "'";
				if (i != selectedItems.length - 1) {
					messageText += ",";
				} 
			}
 
			messageText += "]"; 
          var oValue2 = messageText;
          oPayload.QuestionID = this.Qid[i];
          oPayload.Question = oValue1 ; 
          oPayload.Response = oValue2 ;
          oPayload.QuestionnaireID = oQuestionnaireID;
          oPayload.AnswerID = this.GlobalFormElements[i];
          oPayload.ProjectID = oPrjId;
          oPayload.ProjectTitle = oPrjTitle;
           if(oPayload.Response===""){
              sap.m.MessageBox.show("Please fill all Answer type", sap.m.MessageBox.Icon.Warning, "Warning");
              return;
          }  
            oDataFinalpaylpad.push(oPayload);
        }
        
          
    //    j++;
        //   oPayload = {};
      }

      var myArray = [];
      myArray = oDataFinalpaylpad;
      for(var j=0;j<myArray.length;j++){
                this.oDataModel.update("/ResponseDetails(ProjectID="+myArray[j].ProjectID+",ProjectTitle='"+myArray[j].ProjectTitle+"',QuestionnaireID='"+myArray[j].QuestionnaireID+"',QuestionID='"+myArray[j].QuestionID+"')",myArray[j],{
      	        success: function(odata, Response) {
                    if(j--=== 1){
                     var self = that; 
                     sap.m.MessageBox.show("Data Saved Successfully");
                     var oView = self.getView().byId("oAnsForm");
                     oView.removeAllContent();
                     self._StatusUpdate();
                    } 

            },

                error : function(odata, Response){
                   if(j--=== 1){
                    // MessageBox.error(JSON.parse(odata.responseText).error.message.value); 
                    sap.m.MessageBox.show(JSON.parse(odata.responseText).error.message, sap.m.MessageBox.Icon.ERROR, "Error");
                   }
                }

           });
        } 


        },

        oSaveRequet : function(oEvent){
         var that = this;
         var obj = {}; 
         var oQuestionnaireID = this.getView().byId("oQuestID").getText();
         var oPrjId = parseInt(this.getView().byId("oProjectId").getText());
         var oPrjTitle = this.getView().byId("oProTitle").getText();
         var oForm = this.getView().byId("oAnsForm");
         
           var oDataFinalpaylpad = [];
          
         var j = 0;
        for(var i = 0; i < this.GlobalFormElements.length; i++){
        var oPayload = {
         }

         if(this.GlobalFormElements[i] === "1"){
          var oValue1 = oForm.getContent()[i+j].getText();
            j++;
         var oValue2 = oForm.getContent()[i+j].getValue();
          oPayload.QuestionID = this.Qid[i];
          oPayload.Question = oValue1 ; 
          oPayload.Response = oValue2 ;
          oPayload.QuestionnaireID = oQuestionnaireID;
          oPayload.AnswerID = this.GlobalFormElements[i];
          oPayload.ProjectID = oPrjId;
          oPayload.ProjectTitle = oPrjTitle;
            oDataFinalpaylpad.push(oPayload);

        } else if(this.GlobalFormElements[i] === "2"){
          var oValue1 = oForm.getContent()[i+j].getText();
            j++;
          var oValue2 = oForm.getContent()[i+j].getValue();
          oPayload.QuestionID = this.Qid[i];
          oPayload.Question = oValue1 ; 
          oPayload.Response = oValue2 ;
          oPayload.QuestionnaireID = oQuestionnaireID;
          oPayload.AnswerID = this.GlobalFormElements[i];
          oPayload.ProjectID = oPrjId;
          oPayload.ProjectTitle = oPrjTitle;
            oDataFinalpaylpad.push(oPayload);
        
        } else if(this.GlobalFormElements[i] === "3"){
         var oValue1 = oForm.getContent()[i+j].getText();
            j++;
          var oValue2 = oForm.getContent()[i+j].getValue();
          oPayload.QuestionID = this.Qid[i];
          oPayload.Question = oValue1 ; 
          oPayload.Response = oValue2 ;
          oPayload.QuestionnaireID = oQuestionnaireID;
          oPayload.AnswerID = this.GlobalFormElements[i];
          oPayload.ProjectID = oPrjId;
          oPayload.ProjectTitle = oPrjTitle;
            oDataFinalpaylpad.push(oPayload);

        } else if(this.GlobalFormElements[i] === "4"){
        
          var oValue1 = oForm.getContent()[i+j].getText();
            j++;
          var oValue2 = oForm.getContent()[i+j].getValue();
          oPayload.QuestionID = this.Qid[i];
          oPayload.Question = oValue1 ; 
          oPayload.Response = oValue2 ;
          oPayload.QuestionnaireID = oQuestionnaireID;
          oPayload.AnswerID = this.GlobalFormElements[i];
          oPayload.ProjectID = oPrjId;
          oPayload.ProjectTitle = oPrjTitle;
            oDataFinalpaylpad.push(oPayload);
        }
          else if(this.GlobalFormElements[i] === "5"){
          
          var oValue1 = oForm.getContent()[i+j].getText();
            j++;
          var oValue2 = oForm.getContent()[i+j].getValue();
          oPayload.QuestionID = this.Qid[i];
          oPayload.Question = oValue1 ; 
          oPayload.Response = oValue2 ;
          oPayload.QuestionnaireID = oQuestionnaireID;
          oPayload.AnswerID = this.GlobalFormElements[i];
          oPayload.ProjectID = oPrjId;
          oPayload.ProjectTitle = oPrjTitle;
            oDataFinalpaylpad.push(oPayload);

        }
          else if(this.GlobalFormElements[i] === "7"){
        
          var oValue1 = oForm.getContent()[i+j].getText();
            j++;
          var oValue2 = oForm.getContent()[i+j].getCustomTextOn();
          oPayload.QuestionID = this.Qid[i];
          oPayload.Question = oValue1 ; 
          oPayload.Response = oValue2 ;
          oPayload.QuestionnaireID = oQuestionnaireID;
          oPayload.AnswerID = this.GlobalFormElements[i];
          oPayload.ProjectID = oPrjId;
          oPayload.ProjectTitle = oPrjTitle;
            oDataFinalpaylpad.push(oPayload);
        }
           else if(this.GlobalFormElements[i] === "8"){
        
          var oValue1 = oForm.getContent()[i+j].getText();
            j++;
          var oValue2 = oForm.getContent()[i+j].mProperties.value;
          oPayload.QuestionID = this.Qid[i]
          oPayload.Question = oValue1 ; 
          oPayload.Response = oValue2 ;
          oPayload.QuestionnaireID = oQuestionnaireID;
          oPayload.AnswerID = this.GlobalFormElements[i];
          oPayload.ProjectID = oPrjId;
          oPayload.ProjectTitle = oPrjTitle;
           
            oDataFinalpaylpad.push(oPayload);
        }
        else if(this.GlobalFormElements[i] === "9"){
        
          var oValue1 = oForm.getContent()[i+j].getText();
            j++;
           var selectedItems = oForm.getContent()[i+j].mProperties.selectedKeys;
         	var messageText =  "[";
 
			for (var a = 0; a < selectedItems.length; a++) {
				messageText += "'" + selectedItems[a] + "'";
				if (i != selectedItems.length - 1) {
					messageText += ",";
				} 
			}
 
			messageText += "]"; 
          var oValue2 = messageText;
          oPayload.QuestionID = this.Qid[i];
          oPayload.Question = oValue1 ; 
          oPayload.Response = oValue2 ;
          oPayload.QuestionnaireID = oQuestionnaireID;
          oPayload.AnswerID = this.GlobalFormElements[i];
          oPayload.ProjectID = oPrjId;
          oPayload.ProjectTitle = oPrjTitle;
          
            oDataFinalpaylpad.push(oPayload);
        }
          
    //    j++;
        //   oPayload = {};
      }

      var myArray = [];
      myArray = oDataFinalpaylpad;
      for(var j=0;j<myArray.length;j++){
                this.oDataModel.update("/ResponseDetails(ProjectID="+myArray[j].ProjectID+",ProjectTitle='"+myArray[j].ProjectTitle+"',QuestionnaireID='"+myArray[j].QuestionnaireID+"',QuestionID='"+myArray[j].QuestionID+"')",myArray[j],{
      	        success: function(odata, Response) {
                    if(j--=== 1){
                    var self = that; 
                     sap.m.MessageBox.show("Data Saved Successfully");
                     var oView = self.getView().byId("oAnsForm");
                     oView.removeAllContent();
                    } 

            },

                error : function(odata, Response){
                   if(j--=== 1){
                    // MessageBox.error(JSON.parse(odata.responseText).error.message.value); 
                    sap.m.MessageBox.show(JSON.parse(odata.responseText).error.message, sap.m.MessageBox.Icon.ERROR, "Error");
                   }
                }

           });
        } 


        },
        
     _StatusUpdate : function(oEvent){
         var that = this;
         var projectId = this.ProjectId ;
         var obj = {};
         obj.Project_Status = "OpenWithApprover";
         	var oBusy = new sap.m.BusyDialog();
			oBusy.open();
			this.oDataModel.update("/AssessmentRequests(ID="+projectId+")", obj, {
				success : function (data) {
					var self = that;
					oBusy.close();        
                    },
                Error : function(oEvent){
                    var self = that;
					oBusy.close();
                }
                });
                

				
				
			
        },

		/**
		 * Binds the view to the object path. Makes sure that detail view displays
		 * a busy indicator while data for the corresponding element binding is loaded.
		 * @function
		 * @param {string} sObjectPath path to the object to be bound to the view.
		 * @private
		 */
		_bindView : function (sObjectPath) {
			// Set busy indicator during view binding
			var oViewModel = this.getModel("detailView");

			// If the view was not bound yet its not busy, only if the binding requests data it is set to busy again
			oViewModel.setProperty("/busy", false);

			this.getView().bindElement({
				path : sObjectPath,
				events: {
					change : this._onBindingChange.bind(this),
					dataRequested : function () {
						oViewModel.setProperty("/busy", true);
					},
					dataReceived: function () {
						oViewModel.setProperty("/busy", false);
					}
				}
            });
             this._GetQuestion();
		},

		_onBindingChange : function () {
			var oView = this.getView(),
				oElementBinding = oView.getElementBinding();

			// No data for the binding
			if (!oElementBinding.getBoundContext()) {
				this.getRouter().getTargets().display("detailObjectNotFound");
				// if object could not be found, the selection in the master list
				// does not make sense anymore.
				this.getOwnerComponent().oListSelector.clearMasterListSelection();
				return;
			}

			var sPath = oElementBinding.getPath(),
				oResourceBundle = this.getResourceBundle(),
				oObject = oView.getModel().getObject(sPath),
				sObjectId = oObject.ID,
				sObjectName = oObject.ProjectTitle,
				oViewModel = this.getModel("detailView");

			this.getOwnerComponent().oListSelector.selectAListItem(sPath);

			oViewModel.setProperty("/shareSendEmailSubject",
				oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
			oViewModel.setProperty("/shareSendEmailMessage",
				oResourceBundle.getText("shareSendEmailObjectMessage", [sObjectName, sObjectId, location.href]));
		},

		_onMetadataLoaded : function () {
			// Store original busy indicator delay for the detail view
			var iOriginalViewBusyDelay = this.getView().getBusyIndicatorDelay(),
				oViewModel = this.getModel("detailView"),
				oLineItemTable = this.byId("lineItemsList"),
				iOriginalLineItemTableBusyDelay = oLineItemTable.getBusyIndicatorDelay();

			// Make sure busy indicator is displayed immediately when
			// detail view is displayed for the first time
			oViewModel.setProperty("/delay", 0);
			oViewModel.setProperty("/lineItemTableDelay", 0);

			oLineItemTable.attachEventOnce("updateFinished", function() {
				// Restore original busy indicator delay for line item table
				oViewModel.setProperty("/lineItemTableDelay", iOriginalLineItemTableBusyDelay);
			});

			// Binding the view will set it to not busy - so the view is always busy if it is not bound
			oViewModel.setProperty("/busy", true);
			// Restore original busy indicator delay for the detail view
			oViewModel.setProperty("/delay", iOriginalViewBusyDelay);
		},

		/**
		 * Set the full screen mode to false and navigate to master page
		 */
		onCloseDetailPress: function () {
			this.getModel("appView").setProperty("/actionButtonsInfo/midColumn/fullScreen", false);
			// No item should be selected on master after detail page is closed
			this.getOwnerComponent().oListSelector.clearMasterListSelection();
			this.getRouter().navTo("master");
		},

		/**
		 * Toggle between full and non full screen mode.
		 */
		toggleFullScreen: function () {
			var bFullScreen = this.getModel("appView").getProperty("/actionButtonsInfo/midColumn/fullScreen");
			this.getModel("appView").setProperty("/actionButtonsInfo/midColumn/fullScreen", !bFullScreen);
			if (!bFullScreen) {
				// store current layout and go full screen
				this.getModel("appView").setProperty("/previousLayout", this.getModel("appView").getProperty("/layout"));
				this.getModel("appView").setProperty("/layout", "MidColumnFullScreen");
			} else {
				// reset to previous layout
				this.getModel("appView").setProperty("/layout",  this.getModel("appView").getProperty("/previousLayout"));
			}
		}
	});

});