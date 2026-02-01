// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

// Énumérations partagées
enum MemberLevel { STANDARD, PREMIUM, VIP }
enum MemberStatus { ACTIVE, BENEFITED, SUSPENDED, EXCLUDED }

// --- STRUCT DEPLACÉE ICI (Hors du contrat) ---
struct MemberRegistration {
    string name;
    address avaliseur;
    string ipfsHash;
    string uri;
    MemberLevel level;
}

contract TontineMembership is ERC721, ERC721URIStorage, AccessControl {
    bytes32 public constant PRESIDENT_ROLE = keccak256("PRESIDENT_ROLE");
    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");
    
    uint256 private _tokenIdCounter;

    struct Memberinfo {
        string name;
        uint256 montantCotisation;
        uint256 caution;
        address avaliseur;
        uint64 createdAt;
        uint64 lastTransferAt;
        uint32 position;
        uint16 penaltiesAccumulated;
        uint8 partsCount;
        MemberStatus status;
        MemberLevel level;
        string ipfsHash;
        address[] previousOwners;
    }

    mapping(uint256 => Memberinfo) public members;
    mapping(address => uint256[]) public memberTokens;

    event MemberCreated(uint256 indexed tokenId, address indexed member, address indexed avaliseur, string name, MemberLevel level);
    event PositionUpdated(uint256 indexed tokenId, uint256 oldPosition, uint256 newPosition);
    event MemberStatusChanged(uint256 indexed tokenId, MemberStatus oldStatus, MemberStatus newStatus);

    constructor(address admin, string memory tontineName, string memory tontineSymbol) ERC721(tontineName, tontineSymbol) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(PRESIDENT_ROLE, admin);
        _tokenIdCounter = 1;
    }

    modifier onlyAdminOrManager() {
        require(hasRole(PRESIDENT_ROLE, msg.sender) || hasRole(MANAGER_ROLE, msg.sender), "Not authorized");
        _;
    }

    modifier onlyValidToken(uint256 tokenId) {
        require(_ownerOf(tokenId) != address(0), "Token inexistant");
        _;
    }

    // ============ FONCTIONS DE GESTION ============

    function updatePosition(uint256 tokenId, uint32 newPosition) external onlyAdminOrManager onlyValidToken(tokenId) {
        uint32 oldPosition = members[tokenId].position;
        members[tokenId].position = newPosition;
        emit PositionUpdated(tokenId, oldPosition, newPosition);
    }

    function updateStatus(uint256 tokenId, MemberStatus newStatus) external onlyAdminOrManager onlyValidToken(tokenId) {
        MemberStatus oldStatus = members[tokenId].status;
        members[tokenId].status = newStatus;
        emit MemberStatusChanged(tokenId, oldStatus, newStatus);
    }

    function markAsBenefited(uint256 tokenId) external onlyAdminOrManager onlyValidToken(tokenId) {
        MemberStatus oldStatus = members[tokenId].status;
        members[tokenId].status = MemberStatus.BENEFITED;
        emit MemberStatusChanged(tokenId, oldStatus, MemberStatus.BENEFITED);
    }

    // ============ LOGIQUE DE MINT (MISE À JOUR) ============

    function mintMembership(
        address to, 
        uint256 montantCotisation,
        uint256 caution,
        MemberRegistration calldata data // <-- On utilise la struct ici
    ) public onlyAdminOrManager returns (uint256) {
        require(to != address(0), "Invalid address");

        uint256 tokenId = _tokenIdCounter++;
        _safeMint(to, tokenId);

        Memberinfo storage m = members[tokenId];
        m.name = data.name;
        m.montantCotisation = montantCotisation;
        m.caution = caution;
        m.avaliseur = data.avaliseur;
        m.createdAt = uint64(block.timestamp);
        m.lastTransferAt = uint64(block.timestamp);
        m.position = uint32(tokenId);
        m.status = MemberStatus.ACTIVE;
        m.level = data.level;
        m.ipfsHash = data.ipfsHash;
        m.partsCount = uint8(memberTokens[to].length + 1);

        _setTokenURI(tokenId, data.uri);
        memberTokens[to].push(tokenId);
        
        emit MemberCreated(tokenId, to, data.avaliseur, data.name, data.level);
        return tokenId;
    }

    // ============ LECTURE & OVERRIDES ============

    function getTokensOf(address owner) external view returns (uint256[] memory) {
        return memberTokens[owner];
    }

    function _update(address to, uint256 tokenId, address auth) internal override(ERC721) returns (address) {
        address from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0)) {
            members[tokenId].lastTransferAt = uint64(block.timestamp);
            members[tokenId].previousOwners.push(from);
            _removeTokenFromOwner(from, tokenId);
            memberTokens[to].push(tokenId);
        }
        return super._update(to, tokenId, auth);
    }

    function _removeTokenFromOwner(address owner, uint256 tokenId) internal {
        uint256[] storage tokens = memberTokens[owner];
        for (uint256 i = 0; i < tokens.length; i++) {
            if (tokens[i] == tokenId) {
                tokens[i] = tokens[tokens.length - 1];
                tokens.pop();
                break;
            }
        }
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) { return super.tokenURI(tokenId); }
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage, AccessControl) returns (bool) { return super.supportsInterface(interfaceId); }
}

// ============ FACTORY MISE À JOUR ============

contract TontineFactory {
    address[] public allTontines;
    event TontineCreated(address indexed tontineAddress, address indexed president, string name);

    function createTontine(string memory _name, string memory _symbol) public {
        // Le créateur de la tontine devient l'admin (Président)
        TontineMembership newTontine = new TontineMembership(msg.sender, _name, _symbol);
        allTontines.push(address(newTontine));
        emit TontineCreated(address(newTontine), msg.sender, _name);
    }

    function getTontinesCount() public view returns (uint256) {
        return allTontines.length;
    }
}