const DropApp = {
    data() {
        return {
            solana: {
                endpoint: "",
                connection: {},
            },
            account: {
                public: "none",
                private: "none",
                balance: 0
            },
            steps: {
                start: false,
            },
        }
    },
    computed: {
        nextDisabled() {
            if (this.steps.start) {
                return false;
            }
            return true;
        },
    },
    methods: {
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
        }
    }
  }
  
  Vue.createApp(DropApp).mount('#drop-app')