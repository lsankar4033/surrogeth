<template>
  <div class="hello">
    <h1>Relayer:</h1>
    <p>
      {{ this.relayer }}
    </p>
  </div>
</template>

<script>
import { SurrogethClient } from "surrogeth-client";
import { ethers } from "ethers";

export default {
  name: "HelloWorld",
  props: {
    msg: String
  },

  data() {
    return {
      surrogethClient: SurrogethClient,
      relayer: null
    };
  },

  async created() {
    const provider = new ethers.providers.InfuraProvider(
      "kovan",
      "https://kovan.infura.io/v3/85fe482e0db94cbeb9020e7173a481f7"
    );
    const client = new SurrogethClient(
      provider,
      "KOVAN",
      "0x90cD6Abb6683FcB9Da915454cC49F3fa4cb0a5b1"
    );

    const relayers = await client.getRelayers(1, new Set([]), new Set(["ip"]));
    this.relayer = relayers[0];

    // NOTE: expect failure
    await client.submitTx({}, relayers[0]);
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
