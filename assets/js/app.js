const DropApp = {
    data() {
        return {
            solana: {
                endpoint: "",
                connection: {},
            },
            account: {
                public: "none",
                publicKey: {},
                private: "none",
                balance: 0,
            },
            steps: {
                start: false,
            },
            recipients: {
                asString: "",
                asArray: [],
            },
            forEach: 0,
        }
    },
    computed: {
        nextDisabled() {
            if (this.steps.start) {
                return false;
            }
            return true;
        },
        recipientsCount() {
            return this.recipients.asArray.length;
        },
    },
    methods: {
        sayAlert(message) {
            alert(message);
        },
        startSelectChange() {
            this.steps.start = false;
            this.testConnection();
        },
        testConnection() {
            self = this;
            endPointStr = this.solana.endpoint;
            if (endPointStr == "" || endPointStr == " ") {
                self.steps.start = false;
                console.log("error connection endpoint is not set correctly");
            }

            this.solana.connection = new solanaWeb3.Connection (this.solana.endpoint)
            this.solana.connection.getEpochInfo()
            .then(
                function(val) {
                    self.steps.start = true;
                },
                function(err) {
                    self.steps.start = false;
                    console.log(err);
                }
            );
        },
        createAccount() {
            keypair = new solanaWeb3.Keypair();
            this.account.private = keypair.secretKey;
            this.account.public = keypair.publicKey.toString();
            this.account.publicKey = keypair.publicKey;
        },

        requestAirdrop() {
            publicKey = this.account.publicKey;
            self = this;
            if (publicKey != "none" && publicKey != "" && publicKey != " ") {
                self.solana.connection.requestAirdrop(publicKey, 1000000000);//0.000000001
            }
            self.checkBalance();
        },

        checkBalance() {
            publicKey = this.account.publicKey;
            self = this;
            if (publicKey != "none" && publicKey != "" && publicKey != " ") {
                self.solana.connection.getBalance(publicKey)
                .then(
                    function(val) {
                        self.account.balance = parseFloat(val) / 1000000000;
                    },
                    function(err) {
                        console.log(err);
                    }
                );
            }
        },
        CSVToArray( strData, strDelimiter ) {
            // Check to see if the delimiter is defined. If not,
            // then default to comma.
            strDelimiter = (strDelimiter || ",");
    
            // Create a regular expression to parse the CSV values.
            var objPattern = new RegExp(
                (
                    // Delimiters.
                    "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +
    
                    // Quoted fields.
                    "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
    
                    // Standard fields.
                    "([^\"\\" + strDelimiter + "\\r\\n]*))"
                ),
                "gi"
                );
    
    
            // Create an array to hold our data. Give the array
            // a default empty first row.
            var arrData = [[]];
    
            // Create an array to hold our individual pattern
            // matching groups.
            var arrMatches = null;
    
    
            // Keep looping over the regular expression matches
            // until we can no longer find a match.
            while (arrMatches = objPattern.exec( strData )){
    
                // Get the delimiter that was found.
                var strMatchedDelimiter = arrMatches[ 1 ];
    
                // Check to see if the given delimiter has a length
                // (is not the start of string) and if it matches
                // field delimiter. If id does not, then we know
                // that this delimiter is a row delimiter.
                if (
                    strMatchedDelimiter.length &&
                    strMatchedDelimiter !== strDelimiter
                    ){
    
                    // Since we have reached a new row of data,
                    // add an empty row to our data array.
                    arrData.push( [] );
    
                }
    
                var strMatchedValue;
    
                // Now that we have our delimiter out of the way,
                // let's check to see which kind of value we
                // captured (quoted or unquoted).
                if (arrMatches[ 2 ]){
    
                    // We found a quoted value. When we capture
                    // this value, unescape any double quotes.
                    strMatchedValue = arrMatches[ 2 ].replace(
                        new RegExp( "\"\"", "g" ),
                        "\""
                        );
    
                } else {
    
                    // We found a non-quoted value.
                    strMatchedValue = arrMatches[ 3 ];
    
                }
    
    
                // Now that we have our value string, let's add
                // it to the data array.
                arrData[ arrData.length - 1 ].push( strMatchedValue );
            }
    
            // Return the parsed data.
            return( arrData );
        },
        uploadCSV(event) {
            //console.log(event);
            self = this;
            if(!window.FileReader) {
                alert("browser not supported");
                return;
            } // Browser is not compatible
        
            var reader = new FileReader();
        
            reader.onload = function(event) {
                //console.log(evt);
                if(event.target.readyState != 2) return;
                if(event.target.error) {
                    alert('Error while reading file');
                    return;
                }
        
                filecontent = event.target.result;
        
                self.recipients.asString = filecontent;
                self.recipients.asArray = self.CSVToArray(filecontent);
                console.log(self.recipients.asArray.length);
            };
        
            reader.readAsText(event.target.files[0]);
        },
    }
  }
  
  Vue.createApp(DropApp).mount('#drop-app')