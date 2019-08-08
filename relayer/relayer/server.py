from flask import Flask, jsonify
from webargs import fields
from webargs.flaskparser import use_args

app = Flask(__name__)

DEFAULT_FEE = (0.05) * (10 ** 18) # 0.05 Eth

def is_hex(s):
    return s.startswith("0x")

# NOTE: We can generalize this by doing something similar to what 0x presents in their relayer spec:
# https://github.com/0xProject/standard-relayer-api/blob/master/http/v2.md#post-v2order_config
# Namely, allow clients to submit the full tx they plan on submitting and allow relayer to compute an
# appropriate fee accordingly
@app.route('/fee', methods=['GET'])
@use_args({ 'gasEstimate': fields.Int() })
def fee(args):
    """Returns the fee in wei that this relayer would charge for a tx with the corresponding gas estimate
    """
    return jsonify({ 'fee_wei': DEFAULT_FEE })

# TODO: Add route for getting relayer's address

SUBMIT_TX_ARGS = {
    'to': fields.String(required=True, validate=is_hex),
    'data': fields.String(required=True, validate=is_hex),
    'value': fields.Int(required=True)
}

@app.route('/submit_tx', methods=['POST'])
@use_args(SUBMIT_TX_ARGS)
def submit_tx(args):
    """TODO: docstring
    """
    # TODO: make sure to change msg.value
    pass
