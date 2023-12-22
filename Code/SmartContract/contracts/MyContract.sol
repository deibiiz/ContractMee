// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract MyContract is ERC721, AccessControl {
    uint256 tokenID;
    mapping(uint256 => ContractDetails) public contractDetails;
    struct ContractDetails {
        uint256 salary;
        uint256 startDate;
        uint256 duration;
        string description;
        bool isSigned;
        address worker;
        bool isFinished;
        bool isPaused;
        uint256 pauseTime;
        uint256 pauseDuration;
    }
    event ContractSigned(uint256 indexed tokenId, address worker);
    event SalaryReleased(uint256 indexed tokenId, uint256 salary);
    event TokenMinted(uint256 tokenId);
    event ContractCancelled(uint256 indexed tokenId);

    bytes32 public constant CONTRACT_MANAGER_ROLE =
        keccak256("CONTRACT_MANAGER_ROLE");

    constructor() ERC721("MyToken", "MTK") {
        _grantRole(CONTRACT_MANAGER_ROLE, msg.sender);
        (CONTRACT_MANAGER_ROLE, msg.sender);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, AccessControl) returns (bool) {
        return
            ERC721.supportsInterface(interfaceId) ||
            AccessControl.supportsInterface(interfaceId);
    }

    function mint(
        address _to,
        uint256 _salary,
        uint256 _duration,
        string memory _description
    ) public payable returns (uint256) {
        require(
            msg.value >= _salary,
            "Dede enviar el salario como valor del contrato"
        );
        require(
            hasRole(CONTRACT_MANAGER_ROLE, _to) != false,
            "El trabajador no puede ser un manager del contrato"
        );
        tokenID++;
        _mint(msg.sender, tokenID);
        uint256 remainder = msg.value - _salary;
        if (remainder > 0) {
            payable(msg.sender).transfer(remainder);
        }

        ContractDetails memory newContract = ContractDetails({
            salary: _salary,
            startDate: block.timestamp, // en segundos
            duration: _duration,
            description: _description,
            isSigned: false,
            worker: _to,
            isFinished: false,
            isPaused: false,
            pauseTime: 0,
            pauseDuration: 0
        });

        contractDetails[tokenID] = newContract;
        emit TokenMinted(tokenID);

        return tokenID;
    }

    function signContract(uint256 _tokenID) public {
        try this.ownerOf(_tokenID) {} catch {
            revert("El token no existe."); // he intentado hacerlo con _exists pero no me ha funcionado
        }
        require(
            hasRole(CONTRACT_MANAGER_ROLE, msg.sender),
            "No puedes firmar tu propio contrato"
        );
        require(
            msg.sender == contractDetails[_tokenID].worker,
            "Solo el trabajador puede firmar el contrato"
        );
        require(
            !contractDetails[_tokenID].isSigned,
            "El contrato ya ha sido firmado"
        );
        require(
            contractDetails[_tokenID].isFinished == false,
            "El contrato ha finalizado"
        );
        require(
            contractDetails[_tokenID].startDate +
                contractDetails[_tokenID].duration >=
                block.timestamp,
            "El contrato ha expirado"
        );

        contractDetails[_tokenID].isSigned = true;
        contractDetails[_tokenID].worker = msg.sender;
        emit ContractSigned(_tokenID, msg.sender);
    }

    function releaseSalary(uint256 _tokenID) public payable {
        try this.ownerOf(_tokenID) {} catch {
            revert("El token no existe."); // he intentado hacerlo con _exists pero no me ha funcionado
        }
        require(
            contractDetails[_tokenID].isSigned,
            "El contrato no ha sido firmado"
        );
        require(
            hasRole(CONTRACT_MANAGER_ROLE, msg.sender),
            "Solo un manager puede liberar el salario"
        );
        require(
            contractDetails[_tokenID].isFinished == true ||
                contractDetails[_tokenID].startDate +
                    contractDetails[_tokenID].duration <=
                block.timestamp,
            "El contrato no ha expirado aun o no ha finalizado"
        );
        require(
            contractDetails[_tokenID].isPaused == false,
            "El contrato esta pausado"
        );

        address payable worker = payable(contractDetails[_tokenID].worker);
        uint256 salary = contractDetails[_tokenID].salary;
        worker.transfer(salary);
        emit SalaryReleased(_tokenID, salary);
    }

    function finalizeContract(uint256 _tokenID) public {
        try this.ownerOf(_tokenID) {} catch {
            revert("El token no existe."); // he intentado hacerlo con _exists pero no me ha funcionado
        }
        require(
            hasRole(CONTRACT_MANAGER_ROLE, msg.sender),
            "Solo un manager puede finalizar un contrato"
        );
        require(
            contractDetails[_tokenID].isSigned,
            "El contrato no ha sido firmado"
        );
        require(
            contractDetails[_tokenID].isFinished == false,
            "El contrato ya ha finalizado"
        );
        require(
            contractDetails[_tokenID].startDate +
                contractDetails[_tokenID].duration >
                block.timestamp,
            "El contrato ya ha expirado"
        );

        contractDetails[_tokenID].isFinished = true;
    }

    function pauseContract(uint256 _tokenID) public {
        try this.ownerOf(_tokenID) {} catch {
            revert("El token no existe."); // he intentado hacerlo con _exists pero no me ha funcionado
        }
        require(
            hasRole(CONTRACT_MANAGER_ROLE, msg.sender),
            "Solo un manager puede pausar un contrato"
        );
        require(
            contractDetails[_tokenID].isSigned,
            "El contrato no ha sido firmado"
        );
        require(
            contractDetails[_tokenID].startDate +
                contractDetails[_tokenID].duration >=
                block.timestamp,
            "El contrato ha expirado"
        );
        require(
            !contractDetails[_tokenID].isPaused,
            "El contrato ya esta pausado"
        );

        contractDetails[_tokenID].isPaused = true;
        contractDetails[_tokenID].pauseTime = block.timestamp;
    }

    function unPauseContract(uint256 _tokenID) public {
        try this.ownerOf(_tokenID) {} catch {
            revert("El token no existe."); // he intentado hacerlo con _exists pero no me ha funcionado
        }
        require(
            hasRole(CONTRACT_MANAGER_ROLE, msg.sender),
            "Solo un manager puede reanudar un contrato"
        );
        require(
            contractDetails[_tokenID].isSigned,
            "El contrato no ha sido firmado"
        );
        require(
            contractDetails[_tokenID].isPaused,
            "El contrato no esta pausado"
        );

        contractDetails[_tokenID].pauseDuration =
            block.timestamp -
            contractDetails[_tokenID].pauseTime;

        contractDetails[_tokenID].duration += contractDetails[_tokenID]
            .pauseDuration;

        contractDetails[_tokenID].pauseTime = 0;
        contractDetails[_tokenID].isPaused = false;
    }

    function cancelContract(uint256 _tokenID) public {
        try this.ownerOf(_tokenID) {} catch {
            revert("El token no existe."); // he intentado hacerlo con _exists pero no me ha funcionado
        }
        require(
            hasRole(CONTRACT_MANAGER_ROLE, msg.sender),
            "Solo un manager puede cancelar un contrato"
        );
        require(
            !contractDetails[_tokenID].isSigned,
            "El contrato ya ha sido firmado"
        );

        address payable owner = payable(msg.sender);
        uint256 salary = contractDetails[_tokenID].salary;
        owner.transfer(salary);
        _burn(_tokenID);
        emit ContractCancelled(_tokenID);
    }

    function assignManager(address _newManager) public {
        require(
            hasRole(CONTRACT_MANAGER_ROLE, msg.sender),
            "Solo un manager puede asignar otro manager"
        );
        grantRole(CONTRACT_MANAGER_ROLE, _newManager);
    }

    function revokeManager(address _manager) public {
        require(
            hasRole(CONTRACT_MANAGER_ROLE, msg.sender),
            "Solo un manager puede revocar otro manager"
        );
        revokeRole(CONTRACT_MANAGER_ROLE, _manager);
    }

    //Funcion para modificar un contrato que no haya sido firmado
    //Funcion para modificar un contrato que haya sido firmado con la aprobación del trabajador
    //funcion para abrir un disputa en un contrato activo. Tanto como trabajador como como empleador
    //funcion para analis: que permita saber el salario medio, el numero de contratos firmados, el numero de contratos activos, el numero de contratos cancelados, el numero de contratos finalizados, el numero de contratos en disputa, el numero de contratos que han expirado
    //Fucnion que penalice a un trabajador que no haya cumplido con el contrato
}
