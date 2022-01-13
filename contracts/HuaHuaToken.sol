// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/token/erc20/ERC20.sol";

contract HuaHuaToken is ERC20 {
    constructor(address _tokenOwner) ERC20("Huahua Token", "HHT") {
        _mint(_tokenOwner, 10_000_000_000_000_000_000_000_000_000);
    }
}
