const DropApp = {
    data() {
        return {
            solana: {
                endpoint: "",
                connection: {},
                fee: 0,
            },
            account: {
                public: "",
                publicKey: {},
                private: "",
                balance: 0,
                airdropMe: 10,
                mnemonic: "",
            },
            steps: {
                start: false,
            },
            recipients: {
                asString: "",
                asArray: [],
            },
            forEach: 0,
            outBalance: 0,
            airdropLog: [],
            alert: false,
            alertMessage: "Hi)",
            error: false,
            errorMessage: "Attn!",
            restoreDisabled: true,
            finishDisabled: true,
            startAirdropDisabled: false,
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
        airdropAmount() {
            let feeSol = this.solana.fee / 1000000000;
            let totalFee = this.recipientsCount * feeSol;
            let totalBudget = this.account.balance - totalFee;
            return totalBudget / this.recipientsCount;
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
                    self.updateFee();
                    self.showAlert("Solana network connected to: " + self.solana.endpoint);
                },
                function(err) {
                    self.steps.start = false;
                    console.log(err);
                }
            );
        },
        createAccount() {
            const mnemonic = bip39.generateMnemonic();
            
            this.account.mnemonic = mnemonic;
            this.generateAccount(mnemonic);
        },
        restoreAccount() {
            this.account.mnemonic = this.account.mnemonic.trim();

            if(this.account.mnemonic != "" || this.account.mnemonic != " ") {
                $('#restoreModal').modal('toggle');
                this.generateAccount(this.account.mnemonic);
            }
        },
        generateAccount(mnemonic) {
            let self = this;
            bip39.mnemonicToSeed(mnemonic)
            .then(
                function (seed) {
                    //console.log(seed);
                    keypair = solanaWeb3.Keypair.fromSeed(seed.slice(0, 32));
                    self.account.private = keypair.secretKey;
                    self.account.public = keypair.publicKey.toString();
                    self.account.publicKey = keypair.publicKey;
                    self.showAlert("Airdrop account '" + keypair.publicKey + "' is created/restored! ");
                },
                function(err) {
                    console.log(err);
                }
            );
        },
        showAlert(message) {
            let self = this;
            self.alertMessage = message;
            self.alert = true;
            setTimeout(function () {
                self.alert = false;
            }, 5000);
        },
        showError(message) {
            let self = this;
            self.errorMessage = message;
            self.error = true;
            setTimeout(function () {
                self.error = false;
            }, 5000);
        },
        requestAirdrop() {
            publicKey = this.account.publicKey;
            self = this;
            if (publicKey != "" && publicKey != " ") {
                self.solana.connection.requestAirdrop(publicKey, self.account.airdropMe * 1000000000)
                .then(
                    function(val) {
                        self.showAlert("Airdrop " + self.account.airdropMe + " sol requested! Update balance after 10 seconds if it dont updates automaticaly.");
                        setTimeout(function () {
                            self.checkBalance();
                        }, 10000);
                    },
                    function(err) {
                        console.log(err);
                    }
                );
            }
        },
        updateFee() {
            let self = this;
            this.solana.connection.getRecentBlockhash()
            .then(
                function(val, feeCalc) {
                    //alert(val.feeCalculator.lamportsPerSignature);
                    self.solana.fee = val.feeCalculator.lamportsPerSignature;
                },
                function(err) {
                    console.log(err);
                }
            );
        },
        checkBalance() {
            publicKey = this.account.publicKey;
            self = this;
            if (publicKey != "none" && publicKey != "" && publicKey != " ") {
                self.solana.connection.getBalance(publicKey)
                .then(
                    function(val) {
                        self.account.balance = parseFloat(val) / 1000000000;
                        self.showAlert("Account balance updated: " + self.account.balance + " sol");
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
        makeAirdrop() {
            let self = this;
            if (!self.startAirdropDisabled) {
                self.startAirdropDisabled = true;
                self.showAlert("Airdrop started. Log appears soon...");
                self.recipients.asArray.forEach(function(value){
                    let address = value.toString();
                    address = address.trim();
                    address = address.replace(",", "");
                    self.sendTransaction(address, self.airdropAmount * 1000000000);
                });
                self.startAirdropDisabled = false;
                self.finishDisabled = false;
            }
        },
        sendTransaction(recipientPublicKey, recipientAmount) {
            self = this;
            account = window.solanaWeb3.Keypair.fromSecretKey(self.account.private);
            const transaction = new window.solanaWeb3.Transaction().add(solanaWeb3.SystemProgram.transfer({
              fromPubkey: account.publicKey,
              toPubkey: new window.solanaWeb3.PublicKey(recipientPublicKey),
              lamports: recipientAmount,
            }));

            window.solanaWeb3.sendAndConfirmTransaction(
              self.solana.connection,
              transaction,
              [account]
            )
            .then(
                function(val) {
                    self.airdropLog.push("Address: " + recipientPublicKey + ", amount: " + self.airdropAmount + " sol, result: success");
                },
                function(err) {
                    console.log(err);
                    self.airdropLog.push("Address: " + recipientPublicKey + ", amount: " + self.airdropAmount + " sol, result: error");
                }
            );
        },
        wizardRestart() {
            location.reload();
        },
    }
  }
  
  Vue.createApp(DropApp).mount('#drop-app')