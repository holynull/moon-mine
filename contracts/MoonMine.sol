// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./lib/TransferHelper.sol";

contract MoonMine is Ownable {
    using SafeMath for uint256;

    address public token;
    address public tokenOwner;
    mapping(address => uint256) public claimed;
    address public proxy;

    event Claim(address indexed owner, uint256 value);
    event Value(address indexed owner, uint256 value);
    event SetProxy(address _proxy);
    event SetToken(address _token);

    constructor(
        address _proxy,
        address _token,
        address _tokenOwner,
        address _owner
    ) {
        proxy = _proxy;
        token = _token;
        tokenOwner = _tokenOwner;
        transferOwnership(_owner);
    }

    function setProxy(address _proxy) public onlyOwner {
        proxy = _proxy;
        emit SetProxy(_proxy);
    }

    function claim(address _who, uint256 _balance) public {
        require(msg.sender == proxy, "PROXY_ONLY");
        uint256 toClaim = _balance.sub(claimed[_who]);
        require(toClaim > 0, "NOTHING_TO_CLAIM");
        claimed[_who] = _balance;
        TransferHelper.safeTransferFrom(token, tokenOwner, _who, toClaim);
        emit Claim(_who, toClaim);
        emit Value(_who, _balance);
    }

    function doOverride(address[] memory who, uint256[] memory _balances)
        public
        onlyOwner
    {
        require(who.length == _balances.length, "DATA_NOT_MATCH");
        for (uint256 i = 0; i < _balances.length; i++) {
            claimed[who[i]] = _balances[i];
            emit Value(who[i], _balances[i]);
        }
    }

    function setToken(address _token) external onlyOwner {
        token = _token;
        emit SetToken(_token);
    }
}
