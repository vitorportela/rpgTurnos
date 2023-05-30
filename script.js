
// Variáveis globais
var numero_vitorias = 0;
var habilidade_passiva = 0;
var habilidade_ativa = 0;
var habilidade_nome = '';
var especial = 1;
var enemyHP = 100;
var playerHP = 100;
var stun_status = 0;
var turno = 1;
var timer = 0;
var timeoutId;
//variaveis de estatisticas de combate
var danoTotalPlayer=0;
var danoTotalEnemy=0;
var curaTotalPlayer=0;
var curaTotalEnemy=0;

//focar no primeiro elemento da tela
////////////////////ACESSIBILIDADE//////////////////////////////
window.addEventListener('load', function() {
    focarElemento(document.getElementById('nomeJogo'));
});

//botao.setAttribute('aria-label', 'Botão B');
// Classe para as habilidades passivas
class Habilidade_Passiva {
    constructor(name, vida_extra, dano_extra, defesa, life_steal, habilidade) {
        this.name = name;
        this.vida_extra = vida_extra;
        this.dano_extra = dano_extra;
        this.defesa = defesa;
        this.life_steal = life_steal;
        this.habilidade = habilidade;
    }
}
// Habilidades passivas
var habilidades = [];
const Resistente = new Habilidade_Passiva("Resistente", 100, -20, -20, 0, 1);
const Berzeker =     new Habilidade_Passiva("Berzeker", 0, 48, -24, 0, 1);
const Vampirismo = new Habilidade_Passiva("Vampirismo", 0, 0, -12, 40, 1);
const Balanceado = new Habilidade_Passiva("Balanceado", 0, 15, 10, 0, 1);
const Lutador   =     new Habilidade_Passiva("Lutador", 20, 20, 0, 0, 0);
const Habilidoso   = new Habilidade_Passiva("Habilidoso", -10, 0, 10, 0, 2);
habilidades.push(Resistente, Berzeker, Vampirismo, Balanceado, Lutador, Habilidoso);
// habilidades ativas
var habilidade_ativas = ["💚 Regenerar", "⚔️ Ataque Duplo", "🔨 Ataque Atordoante", "🩸 Ataque Vampirico", "💥 Mata Gigantes"];

// Classe para os personagens
class personagem{
    constructor(id, name, hab_passiva,habchoice) {
        if (habchoice === null || habchoice === undefined) {
            this.habchoice = null;
          } else {
            this.habchoice = habchoice;
          }
        this.hab_passiva = hab_passiva;
        this.id = id;
        this.name = name;
        this.vida_maxima = 100 + hab_passiva.vida_extra;
        this.ataque_basico = 20;
        this.defesa = hab_passiva.defesa/100;
        this.hp = this.vida_maxima;
        this.danoRecebido = 0;
        this.curaRecebido = 0;
        this.habNum =  hab_passiva.habilidade;
        this.stun = 0;
        // habilidades
        this.habs = [
            function HabCura() {
                if(id>0){
                    if(this.hp>= this.vida_maxima*50/100 || this.habNum == 0){
                        return this.efetuar_ataque();
                    }
                }
            habilidade_nome = 'Cura';
            this.habNum -= 1;
            this.efetuar_cura(Math.ceil(this.vida_maxima * 0.4));
            return 0;
            },
            function HabAtkCritico() {
                if(id>0){
                    if(this.hp>= this.vida_maxima*70/100||this.habNum == 0 ){
                        return this.efetuar_ataque();
                    }
                }
                habilidade_nome = 'Ataque Duplo';
                this.habNum -= 1;
                return this.efetuar_ataque() + this.efetuar_ataque();
            },
            function HabAtkStun() {
                if(id>0){
                    if(this.hp>= this.vida_maxima*90/100||this.habNum == 0 ){
                        return this.efetuar_ataque();
                    }
                }
                habilidade_nome = 'Ataque Atordoante';
                this.habNum -= 1;
                stun_status = 1;
                var atk = this.efetuar_ataque();
                if(atk<=20){
                    atk=20;
                }
                return atk;
            },
            function habAtkVamp() {
                if(id>0){
                    if(this.hp>= this.vida_maxima*60/100||this.habNum == 0 ){
                        return this.efetuar_ataque();
                    }
                }
                habilidade_nome = 'Ataque vampirico';
                this.habNum -= 1;
                var atk = this.efetuar_ataque();
                this.efetuar_cura(atk);
                return atk;
            },
            function habKillGiant() {
                var hp = enemyHP;
                if(id>0){
                    if(this.habNum == 0 ){
                        return this.efetuar_ataque();
                    }
                    hp = playerHP;
                }
                habilidade_nome = 'Ataque Mata Gigante';
            this.habNum -= 1;
            return 18 + (hp*18/100);
            }
        ];
    }
// funcoes de ataque, dano e habilidade ---------------------------------------------------------------------------------------
    receber_ataque(valor){
        this.stun = stun_status;
        stun_status = 0;
        this.danoRecebido = Math.ceil(valor - (valor * this.defesa));
        this.hp -= this.danoRecebido;
    }
    efetuar_ataque() {
        var atk = Math.floor(Math.random() * 4) + this.ataque_basico - 3;
        this.efetuar_cura(Math.ceil((atk + (atk*this.hab_passiva.dano_extra/100))*this.hab_passiva.life_steal/100));
        return Math.ceil(atk + (atk*this.hab_passiva.dano_extra/100)); 
    }
    efetuar_cura(curinha){
        this.hp += Math.ceil(curinha);
        this.curaRecebido += Math.ceil(curinha);
    }
    usarHabilidade() {
        if(this.habchoice==null){
            return this.efetuar_ataque();
        }
        const habilidade = this.habs[this.habchoice];
        return habilidade.call(this); // Chama a função da habilidade dentro do contexto da classe     
    }
    end_turn(){
        this.danoRecebido = 0;
        this.curaRecebido = 0;
    }
}

//|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||

function nomeAleatorio() {
    const nomes = [
      "Alexander", "Benjamin", "Catherine", "Diana", "Elijah", "Fiona", "George", "Hannah", "Indiana", "Joe", "Kevin", "Luna",
      "Matthew", "Natan", "Oliver", "Pepe", "Quentin", "Lady Rachel", "Sebastian", "Tomas", "Ursula", "Victor", "Wendy", "Xavier",
      "Yana", "Zack"
    ];
  
    const sobrenomes = [
      "Anderson", "Brown", "Carter", "Davis", "Evans", "Ford", "Garcia", "Harris", "Irwin", "Johnson", "Kennedy", "Lopez",
      "Miller", "Nakamura", "O'Connor", "Park", "Quinn", "Robinson", "Smith", "Taylor", "Underwood", "Valencia", "Walker",
      "Xayvong", "Young", "Zion"
    ];
  
    const nomeAleatorio = nomes[Math.floor(Math.random() * nomes.length)];
    const sobrenomeAleatorio = sobrenomes[Math.floor(Math.random() * sobrenomes.length)];
    return `${nomeAleatorio} ${sobrenomeAleatorio}`;
  }


function selectHabPas(num){
 habilidade_passiva = num;
 focarElemento(document.getElementById('nomeJogo'));//acessibilidade
 if(num===4){
    selectHabAt(null);
 }else{
    document.getElementById("habPassiva").style.display = "none";
    document.getElementById("habAtiva").style.display = "flex";
 }
}
function selectHabAt(num){
    focarElemento(document.getElementById('nomeJogo'));//acessibilidade
    habilidade_ativa = num;
    document.getElementById("habPassiva").style.display = "none";
    document.getElementById("habAtiva").style.display = "none";
    document.getElementById("battle").style.display = "block";
    createPlayer(habilidade_passiva,habilidade_ativa);
    createEnemy();
    updateHP();
}

// Função para criar o personagem
function createPlayer(habP,habA) {
    var elementName = document.getElementById("player-name");
    var x = habilidades[habP];
    if(habP===4){
        habA = null;
        elementName.style.display = "none";
    }
    player = new personagem(0,"Jogador",habilidades[habP],habA);
    if(habP==4){
        elementName.textContent = player.name + ' ('+x.name+')';
        elementName.setAttribute('aria-label', player.name + ' ('+x.name+')');
    }else{
        elementName.textContent = player.name + ' ('+x.name+' , '+habilidade_ativas[habA].slice(2)+')';
        elementName.setAttribute('aria-label', player.name + ' ('+x.name+' , '+habilidade_ativas[habA].slice(2)+')');
    }
    document.getElementById('ability-btn').textContent = habilidade_ativas[habA];
    document.getElementById('ability-btn').setAttribute('aria-label',habilidade_ativas[habA].slice(2));
}
function createEnemy() {
    var elementName = document.getElementById("enemy-name");
    var z = Math.floor(Math.random() * 6)
    var x = habilidades[z];
    var y = Math.floor(Math.random() * 5);
    if(z==4){
        enemy = new personagem(1, nomeAleatorio(), x, null);
        elementName.textContent ='Oponente '+ enemy.name + ' ('+x.name+')';
        elementName.setAttribute('aria-label', enemy.name + ' ('+x.name+')');
    }else{
        enemy = new personagem(1, nomeAleatorio(), x, y);
        str = 'Oponente '+ enemy.name + ' ('+x.name+' , '+habilidade_ativas[y].slice(2)+')';
        elementName.textContent = str;

    }
}
//<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<Fluxo do jogo>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

function inicioBattle(){
    document.getElementById('iniciar-btn').style.display = 'none';
    document.getElementById('attack-btn').style.display = 'block';
    document.getElementById('ability-btn').style.display = 'block';
    updateNarrador('Batalha iniciando...');
    timeoutId = setTimeout(function() {
        updateNarrador('Oponente ' + enemy.name);
        timeoutId = setTimeout(function() {
            updateNarrador('Oponente possui '+ enemyHP +' pontos de vida e '+ enemy.habNum + ' habilidade.');
            timeoutId = setTimeout(function() {
                updateNarrador('Iniciando turno '+ turno +', Turno do Jogador.');
                timeoutId = setTimeout(function() {
                    updateNarrador('Jogador, escolha sua ação...');

                    document.getElementById('attack-btn').disabled = false;
                    if(player.habNum>0){
                        document.getElementById('ability-btn').disabled = false;
                    }         
                }, 3000);    
            }, 4000);   
        }, 2000);    
    }, 2000);
}
//vez do oponente
function mudandoTurno(){
    timer = 2000;
    if(player.stun==0){
        var mensagem1 = '';
        var mensagem2 = '';
        var mensagem3 = '';
        if(player.habNum != especial){
            var mensagem1 = 'Jogador usou '+habilidade_nome+'. ';
            timer += 2000;
        }
        if(player.curaRecebido>0){
            var mensagem3 = 'Jogador curou '+ player.curaRecebido + ' de vida.';
            timer += 2000;
        }
        if(enemy.danoRecebido>0){
            var mensagem2 = 'Oponente recebeu '+ enemy.danoRecebido+ ' de dano. ';
            timer += 2000;
        }
        updateNarrador(mensagem1 + mensagem2 + mensagem3);
    }else{
        updateNarrador('Jogador está atordoado e nao pode executar ação.');
        player.stun = 0;
        stun_status = 0;
    }
    enemy.end_turn();
    player.end_turn();
    timer += 500;
    timeoutId = setTimeout(function() {
        //Teste de Vida
        if(enemyHP<=0){
            victory();
            clearTimeout(timeoutId);
            return;
        }
        if(playerHP<=0){
            defeat();
            clearTimeout(timeoutId);
            return;
        }
        updateNarrador('Jogador com '+playerHP+' de vida e Oponente com '+enemyHP+' de vida.');        
        timer = 2000;
        timeoutId = setTimeout(function() {
            //----------------------------------------------turno do oponente
            updateNarrador('Turno do Oponente...');
            timer = 2000;
            timeoutId = setTimeout(function() {
                if(enemy.stun==0){
                    var mensagem1 = '';
                    var mensagem2 = '';
                    var mensagem3 = '';
                    especial = enemy.habNum;
                    var dano = enemy.usarHabilidade();
                    player.receber_ataque(dano);
                    updateHP();
                    if(enemy.habNum != especial){
                        var mensagem1 = 'Oponente usou '+habilidade_nome+'. ';
                        timer += 2000;
                    }
                    if(enemy.curaRecebido>0){
                        var mensagem3 = 'Oponente curou '+ enemy.curaRecebido + ' de vida.';
                        timer += 2000;
                    }
                    if(player.danoRecebido>0){
                        var mensagem2 = 'Jogador recebeu '+ player.danoRecebido+ ' de dano. ';
                        timer += 2000;
                    }
                    updateNarrador(mensagem1 + mensagem2 + mensagem3);
                    enemy.end_turn();
                    player.end_turn();
                }else{
                    updateNarrador('Oponente está atordoado e nao pode executar ação.');
                    enemy.stun = 0;
                    stun_status = 0;
                }
                timer += 500;
                timeoutId = setTimeout(function() {
                    //Teste de Vida
                    if(enemyHP<=0){
                        victory();
                        clearTimeout(timeoutId);
                        return;
                    }
                    if(playerHP<=0){
                        defeat();
                        clearTimeout(timeoutId);
                        return;
                    }
                    //atualizacao de turno
                    turno++;
                    document.getElementById("turnos").textContent = turno;
                    //-------------------------------------turno do jogador
                    updateNarrador('Jogador com '+playerHP+' de vida e Oponente com '+enemyHP+' de vida.');
                    timer = 6000;
                    timeoutId = setTimeout(function() {
                        updateNarrador('Iniciando turno '+ turno +', Turno do Jogador.');
                        timer = 2000;
                        timeoutId = setTimeout(function() {
                            if(player.stun==0){
                                updateNarrador('Jogador, escolha sua ação...');
                                document.getElementById('attack-btn').disabled = false;
                                if(player.habNum>0){
                                    document.getElementById('ability-btn').disabled = false;
                                }
                            }else{
                                mudandoTurno();
                            }
                        }, timer);
                    }, timer);  
                }, timer);    
            }, timer);    
        }, timer);
    }, timer);
}
// Função de vitória
function victory() {
    numero_vitorias++;
    document.getElementById("vitorias").textContent = numero_vitorias;
    updateNarrador("Oponente está com 0 pontos de vida. Você venceu!");
}
// Função de derrota
function defeat() {
    numero_vitorias=0;
    updateNarrador("Jogador está com 0 pontos de vida. Você perdeu!");
}
// Função de restart
function restart_game(){
    focarElemento(document.getElementById('nomeJogo'));
    restart_atributes();
    numero_vitorias=0;
    document.getElementById("vitorias").textContent = numero_vitorias;
    document.getElementById("habPassiva").style.display = "flex";
    document.getElementById("habAtiva").style.display = "none";
    document.getElementById("battle").style.display = "none";
}

function proximoOponente(){
    restart_atributes();
    clearTimeout(timeoutId);
    document.getElementById("habPassiva").style.display = "none";
    document.getElementById("habAtiva").style.display = "none";
    document.getElementById("battle").style.display = "block";
    createPlayer(habilidade_passiva,habilidade_ativa);
    createEnemy();
    updateHP();
    inicioBattle();
}

function restart_atributes(){
    clearTimeout(timeoutId);
    updateNarrador('');
    document.getElementById("ability-btn").style.display = "block";
    document.getElementById('attack-btn').disabled = true;
    document.getElementById('ability-btn').disabled = true;
    danoTotalPlayer=0;
    danoTotalEnemy=0;
    curaTotalPlayer=0;
    curaTotalEnemy=0;
    turno=0;
}
//Funcao Narrador <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
function updateNarrador(fala) {
    document.getElementById("narrador").textContent = fala;
}
// Função para atualizar os pontos de vida dos personagens e do oponente na tela
function updateHP() {
    var xenemyHP = enemy.hp - enemyHP;
    var xplayerHP = player.hp - playerHP;
    enemyHP = enemy.hp;
    playerHP = player.hp;

    if(player.hp<=0){
        playerHP = 0;
        document.getElementById("player-barra").style.width = 0;  
        document.getElementById("player-hp").textContent = 0;        
    }else{
        document.getElementById("player-hp").textContent = player.hp;
    }

    if(enemy.hp<=0){
        enemyHP=0;
        document.getElementById("enemy-barra").style.width = 0;    
        document.getElementById("enemy-hp").textContent = 0;   
    }else{
        document.getElementById("enemy-hp").textContent = enemy.hp;
    }

    //=========NUMERO DE HABILIDADES=========
    document.getElementById("enemy-sp").textContent = enemy.habNum;
    document.getElementById("player-sp").textContent = player.habNum;

    //==========BARRA DE VIDA ENEMY==========
    document.getElementById("enemy-barra").style.width = (enemy.hp*2)+'px';
    if(xenemyHP>0){
        document.getElementById("enemyHpNum").textContent = '+'+xenemyHP;
        document.getElementById("enemyHpNum").style.color = 'green';
        document.getElementById("enemyHpNum").style.visibility = 'visible';
        document.getElementById("enemyHpNum").style.opacity = 0;
    }
    if(xenemyHP==0){
        document.getElementById("enemyHpNum").style.visibility = 'hidden';
    }
    if(xenemyHP<0){
        document.getElementById("enemyHpNum").textContent = ''+xenemyHP;
        document.getElementById("enemyHpNum").style.color = 'red';
        document.getElementById("enemyHpNum").style.visibility = 'visible';
        document.getElementById("enemyHpNum").style.opacity = 0;
    }
    setTimeout(function() {
        document.getElementById("enemyHpNum").style.opacity = 1;
        document.getElementById("enemyHpNum").style.visibility = 'hidden';
    },1000);

    //==========BARRA DE VIDA PLAYER==========
    document.getElementById("player-barra").style.width = (player.hp*2)+'px';  
    if(xplayerHP>0){
        document.getElementById("playerHpNum").textContent = '+'+xplayerHP;
        document.getElementById("playerHpNum").style.color = 'green';
        document.getElementById("playerHpNum").style.visibility = 'visible';
        document.getElementById("playerHpNum").style.opacity = 0;
    }
    if(xplayerHP==0){
        document.getElementById("playerHpNum").style.visibility = 'hidden';
    }
    if( xplayerHP <0){
        document.getElementById("playerHpNum").textContent = ''+xplayerHP;
        document.getElementById("playerHpNum").style.color = 'red';
        document.getElementById("playerHpNum").style.visibility = 'visible';
        document.getElementById("playerHpNum").style.opacity = 0;
    }
    setTimeout(function() {
        document.getElementById("playerHpNum").style.opacity = 1;
        document.getElementById("playerHpNum").style.visibility = 'hidden';
    },1000);
    
}

// Função de ataque
function attack() {
    especial = player.habNum;
    document.getElementById('attack-btn').disabled = true;
    document.getElementById('ability-btn').disabled = true;
    enemy.receber_ataque(player.efetuar_ataque());
    updateHP();
    mudandoTurno();
}

// Função de habilidade
function ability() {
    especial = player.habNum;
    document.getElementById('attack-btn').disabled = true;
    document.getElementById('ability-btn').disabled = true;
    enemy.receber_ataque(player.usarHabilidade());
    updateHP();
    mudandoTurno();
}

////////////////////ACESSIBILIDADE//////////////////////////////
function focarElemento(input){
    input.setAttribute('tabindex', '-1')
    setTimeout(function() {
        input.setAttribute('tabindex', '0');
        input.focus();
        input.setAttribute('tabindex', '-1');
    },200);
}