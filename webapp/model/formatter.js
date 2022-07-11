sap.ui.define([], function () {
	"use strict";

	return {
		/**
		 * Rounds the currency value to 2 digits
		 *
		 * @public
		 * @param {string} sValue value to be formatted
		 * @returns {string} formatted currency value with 2 digits
		 */
		currencyValue : function (sValue) {
			if (!sValue) {
				return "";
			}

			return parseFloat(sValue).toFixed(2);
        },
        onVisbStatus : function(Key){
              if(Key == "Open"){
                 return "Success";
             }else if(Key == "OpenWithApprover"){
                return "Success";
             }else{
                return "Warning";
            }
        },
        onChange : function(Key){
            if(Key == "OpenWithApprover"){
                return "Submitted";
            }else{
                return Key;
            }
        },
        getBooleanValue : function(Ans){

            var boolAns = new sap.ui.model.type.Boolean();
            
            if(Ans === "true"){
            
            boolAns = true;
            
            }else{
            
            boolAns = false;
            
            }
            
            return boolAns;
            
            }
	};
});