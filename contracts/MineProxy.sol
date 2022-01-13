// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MineProxy is Ownable {
    using ECDSA for bytes32;

    address public signer;

    address public mine;

    event CallClaim(bytes callData, bytes signCallData, address pubkey);
    event SetSigner(address _signer);
    event SetMine(address _mine);

    constructor(address _signer, address _owner) {
        signer = _signer;
        transferOwnership(_owner);
    }

    function callClaim(bytes calldata callData, bytes memory signCallData)
        public
    {
        bytes32 _hash = keccak256(callData);
        address pubkey = _hash.toEthSignedMessageHash().recover(signCallData);
        require(pubkey == signer, "SIGNATURE_IS_WRONG");
        (bool success, ) = mine.call(callData);
        require(success, "DELEGATE_CALL_FAILED");
        emit CallClaim(callData, signCallData, pubkey);
    }

    function setSigner(address _signer) external onlyOwner {
        signer = _signer;
        emit SetSigner(_signer);
    }

    function setMine(address _mine) external onlyOwner {
        mine = _mine;
        emit SetMine(_mine);
    }
}
