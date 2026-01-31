// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

enum MemberLevel { STANDARD, PREMIUM, VIP }
enum MemberStatus { ACTIVE, BENEFITED, SUSPENDED, EXCLUDED }

contract TontineMembership is ERC721, ERC721URIStorage, AccessControl {
    bytes32 public constant PRESIDENT_ROLE = keccak256("PRESIDENT_ROLE");
    uint256 private _tokenIdCounter;

    struct Memberinfo {
        string name;
        uint256 montantCotisation;
        address avaliseur;
        uint256 caution;
        uint256 createdAt;
        uint256 lastTransferAt;
        MemberStatus status;
        MemberLevel level;
        string ipfsHash;
        address[] previousOwners;
        uint256 penaltiesAccumulated;
        uint8 partsCount;
        string uri;
    }

    mapping(uint256 => Memberinfo) public members;
    mapping(address => uint256[]) public memberTokens;
    mapping(address => uint256) public avalisationCount;
    mapping(address => address[]) public avalisedMembers;

    uint8 public constant MAX_PARTS_PER_MEMBER = 2;
    uint8 public constant MAX_AVALISATION_PER_MEMBER = 3;

    event MemberCreated(uint256 indexed tokenId, address indexed member, address indexed avaliseur, string name, MemberLevel level);

    
    // On passe l'adresse du créateur, le nom et le symbole
    constructor(address admin, string memory tontineName, string memory tontineSymbol) ERC721(tontineName, tontineSymbol) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(PRESIDENT_ROLE, admin);
        _tokenIdCounter = 1;
    }

    function mintMembership(address to, string memory name, address avaliseur, uint256 montantCotisation, MemberLevel level, uint256 caution, string memory ipfsHash, string memory uri) public onlyRole(PRESIDENT_ROLE) {
        require(to != address(0), "Adresse invalide");
        require(avaliseur != address(0), "Avaliseur requis");
        require(avaliseur != to, "Auto-avalisation interdite");
        require(avalisationCount[avaliseur] < MAX_AVALISATION_PER_MEMBER, "Limite d'avalisation atteinte");
        require(memberTokens[to].length < MAX_PARTS_PER_MEMBER, "Limite de parts atteinte");

        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter += 1;
        _safeMint(to, tokenId);

        members[tokenId] = Memberinfo({
            name: name,
            montantCotisation: montantCotisation,
            avaliseur: avaliseur,
            caution: caution,
            level: level,
            createdAt: block.timestamp,
            lastTransferAt: block.timestamp,
            status: MemberStatus.ACTIVE,
            ipfsHash: ipfsHash,
            previousOwners: new address[](0),
            penaltiesAccumulated: 0,
            partsCount: uint8(memberTokens[to].length + 1),
            uri: uri
        });

        _setTokenURI(tokenId, uri);
        memberTokens[to].push(tokenId);
        avalisationCount[avaliseur] += 1;
        avalisedMembers[avaliseur].push(to);
        emit MemberCreated(tokenId, to, avaliseur, name, level);
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
// contrat d'usine pour permettre a chaque utilisateur de pouvoir etre president d'une tontine et l'administrer
contract TontineFactory {
    // Liste de toutes les tontines créées sur la plateforme
    address[] public allTontines;

    event TontineCreated(address indexed tontineAddress, address indexed president, string name);

    function createTontine(string memory _name, string memory _symbol) public {
        // Déploiement d'une nouvelle instance de TontineMembership
        // msg.sender devient l'admin et le président du nouveau contrat
        TontineMembership newTontine = new TontineMembership(msg.sender, _name, _symbol);
        
        allTontines.push(address(newTontine));
        
        emit TontineCreated(address(newTontine), msg.sender, _name);
    }

    // Fonction pour voir combien de tontines existent
    function getTontinesCount() public view returns (uint256) {
        return allTontines.length;
    }
}