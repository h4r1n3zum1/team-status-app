// Firebase設定（あなたの実際の設定値）
const firebaseConfig = {
  apiKey: "AIzaSyAp9JExSs-ZEsmvJz8JmtHdawDd5gBMKXc",
  authDomain: "teamstatus-h4r1n3zum1.firebaseapp.com",
  databaseURL: "https://teamstatus-h4r1n3zum1-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "teamstatus-h4r1n3zum1",
  storageBucket: "teamstatus-h4r1n3zum1.firebasestorage.app",
  messagingSenderId: "498093027513",
  appId: "1:498093027513:web:21a7e58c09986ab6ebeb68"
};

// Firebase初期化
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// アイコンコンポーネント
const Icons = {
  Users: () => React.createElement('svg', { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 }, 
    React.createElement('path', { d: 'm16 6 4 14' }),
    React.createElement('path', { d: 'M12 6v14' }),
    React.createElement('path', { d: 'm8 6-4 14' })
  ),
  HelpCircle: () => React.createElement('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 },
    React.createElement('circle', { cx: 12, cy: 12, r: 10 }),
    React.createElement('path', { d: 'm9,9a3,3 0 1,1 6,0c0,2 -3,3 -3,3' }),
    React.createElement('path', { d: 'm12,17h.01' })
  ),
  Minimize2: () => React.createElement('svg', { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 },
    React.createElement('polyline', { points: '4,14 10,14 10,20' }),
    React.createElement('polyline', { points: '20,10 14,10 14,4' }),
    React.createElement('line', { x1: 14, y1: 10, x2: 21, y2: 3 }),
    React.createElement('line', { x1: 3, y1: 21, x2: 10, y2: 14 })
  )
};

const TeamStatusApp = () => {
  const [currentUser, setCurrentUser] = React.useState('田中太郎');
  const [isCompact, setIsCompact] = React.useState(false);
  const [teamMembers, setTeamMembers] = React.useState({});
  const [isLoading, setIsLoading] = React.useState(true);

  // デフォルトユーザー
  const defaultUsers = ['田中太郎', '佐藤花子', '山田次郎', '鈴木美咲'];

  const statusOptions = {
    work: {
      available: { label: '空き', color: 'bg-green-500', emoji: '✅' },
      busy: { label: '忙し', color: 'bg-red-500', emoji: '🔥' },
      focused: { label: '集中', color: 'bg-purple-500', emoji: '⚡' },
      break: { label: '休憩', color: 'bg-blue-500', emoji: '☕' }
    },
    mental: {
      great: { label: '絶好調', color: 'bg-green-500', emoji: '😊' },
      good: { label: '元気', color: 'bg-blue-500', emoji: '🙂' },
      ok: { label: 'まあまあ', color: 'bg-yellow-500', emoji: '😐' },
      tired: { label: '疲れ', color: 'bg-orange-500', emoji: '😔' }
    },
    health: {
      great: { label: '絶好調', color: 'bg-green-500', emoji: '💪' },
      good: { label: '元気', color: 'bg-blue-500', emoji: '✨' },
      ok: { label: 'まあまあ', color: 'bg-yellow-500', emoji: '😌' },
      tired: { label: '疲れ気味', color: 'bg-orange-500', emoji: '😴' }
    }
  };

  // Firebase からデータを読み込み
  React.useEffect(() => {
    const membersRef = database.ref('teamMembers');
    
    // リアルタイムリスナー
    const unsubscribe = membersRef.on('value', (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setTeamMembers(data);
      } else {
        // 初期データを設定
        const initialData = {};
        defaultUsers.forEach(name => {
          initialData[name] = {
            name,
            workStatus: 'available',
            mentalStatus: 'good',
            healthStatus: 'good',
            helpNeeded: false,
            lastUpdated: Date.now()
          };
        });
        membersRef.set(initialData);
      }
      setIsLoading(false);
    });

    return () => membersRef.off('value', unsubscribe);
  }, []);

  // ステータス更新
  const updateStatus = (statusType, value) => {
    const userRef = database.ref(`teamMembers/${currentUser}`);
    userRef.update({
      [statusType]: value,
      lastUpdated: Date.now()
    });
  };

  // ヘルプ要請切り替え
  const toggleHelpNeeded = () => {
    const userRef = database.ref(`teamMembers/${currentUser}`);
    const currentData = teamMembers[currentUser];
    userRef.update({
      helpNeeded: !currentData?.helpNeeded,
      lastUpdated: Date.now()
    });
  };

  // 時間フォーマット
  const formatTime = (timestamp) => {
    const now = Date.now();
    const diffMinutes = Math.floor((now - timestamp) / 60000);
    
    if (diffMinutes < 1) return 'now';
    if (diffMinutes < 60) return `${diffMinutes}m`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h`;
    return `${Math.floor(diffHours / 24)}d`;
  };

  const currentUserData = teamMembers[currentUser];
  const membersArray = Object.values(teamMembers);

  if (isLoading) {
    return React.createElement('div', { className: 'flex items-center justify-center min-h-screen' },
      React.createElement('div', { className: 'text-indigo-600 text-lg' }, 'Loading...')
    );
  }

  if (isCompact) {
    return React.createElement('div', { className: 'w-80 bg-white rounded-lg shadow-2xl border border-gray-200' },
      React.createElement('div', { className: 'p-3 bg-indigo-600 rounded-t-lg' },
        React.createElement('div', { className: 'flex items-center justify-between' },
          React.createElement('div', { className: 'flex items-center gap-2' },
            React.createElement(Icons.Users),
            React.createElement('h1', { className: 'text-white font-semibold text-sm' }, 'チーム状況')
          ),
          React.createElement('button', { 
            onClick: () => setIsCompact(false),
            className: 'text-white hover:bg-indigo-700 p-1 rounded'
          }, React.createElement(Icons.Minimize2))
        )
      ),
      
      React.createElement('div', { className: 'p-3 max-h-96 overflow-y-auto' },
        React.createElement('div', { className: 'space-y-2' },
          ...membersArray.map(member => {
            const workStatus = statusOptions.work[member.workStatus];
            
            return React.createElement('div', { 
              key: member.name,
              className: `p-2 rounded-lg text-xs ${member.helpNeeded ? 'border border-orange-400 bg-orange-50' : 'bg-gray-50'}`
            },
              React.createElement('div', { className: 'flex items-center justify-between' },
                React.createElement('div', { className: 'flex items-center gap-2' },
                  React.createElement('div', { className: `w-2 h-2 rounded-full ${workStatus.color}` }),
                  React.createElement('span', { className: 'font-medium text-gray-800' }, member.name),
                  member.helpNeeded && React.createElement('span', { className: 'bg-orange-500 text-white px-1 py-0.5 rounded text-xs' }, '🆘')
                ),
                React.createElement('span', { className: 'text-gray-400' }, formatTime(member.lastUpdated))
              ),
              
              React.createElement('div', { className: 'flex items-center gap-3 mt-1' },
                React.createElement('span', null, workStatus.emoji),
                React.createElement('span', null, statusOptions.mental[member.mentalStatus].emoji),
                React.createElement('span', null, statusOptions.health[member.healthStatus].emoji)
              )
            );
          })
        ),
        
        // 自分の状況更新
        React.createElement('div', { className: 'mt-3 p-2 bg-indigo-50 rounded-lg' },
          React.createElement('div', { className: 'text-xs font-medium text-indigo-800 mb-2' }, `${currentUser}さんの状況`),
          
          React.createElement('div', { className: 'space-y-2' },
            React.createElement('div', { className: 'flex gap-1' },
              ...Object.entries(statusOptions.work).map(([key, option]) =>
                React.createElement('button', {
                  key,
                  onClick: () => updateStatus('workStatus', key),
                  className: `flex-1 p-1 rounded text-xs ${currentUserData?.workStatus === key ? `${option.color} text-white` : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`
                }, option.emoji)
              )
            ),
            
            React.createElement('div', { className: 'flex gap-1' },
              ...Object.entries(statusOptions.mental).map(([key, option]) =>
                React.createElement('button', {
                  key,
                  onClick: () => updateStatus('mentalStatus', key),
                  className: `flex-1 p-1 rounded text-xs ${currentUserData?.mentalStatus === key ? `${option.color} text-white` : 'bg-gray-200 hover:bg-gray-300'}`
                }, option.emoji)
              )
            ),
            
            React.createElement('div', { className: 'flex gap-1' },
              ...Object.entries(statusOptions.health).map(([key, option]) =>
                React.createElement('button', {
                  key,
                  onClick: () => updateStatus('healthStatus', key),
                  className: `flex-1 p-1 rounded text-xs ${currentUserData?.healthStatus === key ? `${option.color} text-white` : 'bg-gray-200 hover:bg-gray-300'}`
                }, option.emoji)
              )
            ),
            
            React.createElement('button', {
              onClick: toggleHelpNeeded,
              className: `w-full p-2 rounded text-xs font-medium ${currentUserData?.helpNeeded ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`
            }, currentUserData?.helpNeeded ? '🆘 ヘルプ中' : '🤝 ヘルプ要請')
          )
        ),
        
        React.createElement('select', {
          value: currentUser,
          onChange: (e) => setCurrentUser(e.target.value),
          className: 'w-full mt-2 px-2 py-1 border rounded text-xs'
        }, ...defaultUsers.map(name =>
          React.createElement('option', { key: name, value: name }, name)
        ))
      )
    );
  }

  // 通常表示
  return React.createElement('div', { className: 'min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center' },
    React.createElement('div', { className: 'w-96 bg-white rounded-2xl shadow-xl' },
      React.createElement('div', { className: 'p-4 bg-indigo-600 rounded-t-2xl' },
        React.createElement('div', { className: 'flex items-center justify-between' },
          React.createElement('div', { className: 'flex items-center gap-3' },
            React.createElement(Icons.Users),
            React.createElement('h1', { className: 'text-xl font-bold text-white' }, 'チーム状況')
          ),
          React.createElement('button', {
            onClick: () => setIsCompact(true),
            className: 'text-white hover:bg-indigo-700 p-1 rounded',
            title: 'コンパクト表示'
          }, React.createElement(Icons.Minimize2))
        )
      ),

      React.createElement('div', { className: 'p-4' },
        // 自分の状況設定
        React.createElement('div', { className: 'bg-indigo-50 rounded-xl p-4 mb-4' },
          React.createElement('h2', { className: 'text-sm font-semibold mb-3 text-indigo-800' }, `${currentUser}さんの状況`),
          
          React.createElement('div', { className: 'space-y-3' },
            // 仕事状況
            React.createElement('div', null,
              React.createElement('div', { className: 'text-xs text-gray-600 mb-1' }, '🔧 仕事'),
              React.createElement('div', { className: 'grid grid-cols-4 gap-1' },
                ...Object.entries(statusOptions.work).map(([key, option]) =>
                  React.createElement('button', {
                    key,
                    onClick: () => updateStatus('workStatus', key),
                    className: `p-2 rounded text-xs font-medium ${currentUserData?.workStatus === key ? `${option.color} text-white ring-2 ring-indigo-300` : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`
                  }, option.emoji, React.createElement('br'), option.label)
                )
              )
            ),

            // メンタル
            React.createElement('div', null,
              React.createElement('div', { className: 'text-xs text-gray-600 mb-1' }, '💭 メンタル'),
              React.createElement('div', { className: 'grid grid-cols-4 gap-1' },
                ...Object.entries(statusOptions.mental).map(([key, option]) =>
                  React.createElement('button', {
                    key,
                    onClick: () => updateStatus('mentalStatus', key),
                    className: `p-2 rounded text-xs font-medium ${currentUserData?.mentalStatus === key ? `${option.color} text-white ring-2 ring-indigo-300` : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`
                  }, option.emoji, React.createElement('br'), option.label)
                )
              )
            ),

            // 体調
            React.createElement('div', null,
              React.createElement('div', { className: 'text-xs text-gray-600 mb-1' }, '💪 体調'),
              React.createElement('div', { className: 'grid grid-cols-4 gap-1' },
                ...Object.entries(statusOptions.health).map(([key, option]) =>
                  React.createElement('button', {
                    key,
                    onClick: () => updateStatus('healthStatus', key),
                    className: `p-2 rounded text-xs font-medium ${currentUserData?.healthStatus === key ? `${option.color} text-white ring-2 ring-indigo-300` : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`
                  }, option.emoji, React.createElement('br'), option.label)
                )
              )
            ),

            React.createElement('button', {
              onClick: toggleHelpNeeded,
              className: `w-full p-3 rounded-lg text-sm font-bold ${currentUserData?.helpNeeded ? 'bg-orange-500 text-white ring-2 ring-orange-300' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`
            }, React.createElement(Icons.HelpCircle), ' ', currentUserData?.helpNeeded ? '🆘 ヘルプ募集中' : '🤝 ヘルプ要請')
          )
        ),

        // チームメンバーの状況
        React.createElement('div', null,
          React.createElement('h2', { className: 'text-sm font-semibold mb-2 text-gray-800' }, 'チーム状況'),
          React.createElement('div', { className: 'space-y-2 max-h-48 overflow-y-auto' },
            ...membersArray.map(member => {
              const workStatus = statusOptions.work[member.workStatus];
              
              return React.createElement('div', {
                key: member.name,
                className: `p-2 rounded-lg text-xs ${member.helpNeeded ? 'border border-orange-400 bg-orange-50' : 'bg-gray-50'}`
              },
                React.createElement('div', { className: 'flex items-center justify-between' },
                  React.createElement('div', { className: 'flex items-center gap-2' },
                    React.createElement('div', { className: `w-2 h-2 rounded-full ${workStatus.color}` }),
                    React.createElement('span', { className: 'font-medium text-gray-800' }, member.name),
                    member.helpNeeded && React.createElement('span', { className: 'bg-orange-500 text-white px-1 py-0.5 rounded text-xs' }, '🆘')
                  ),
                  React.createElement('span', { className: 'text-gray-400' }, formatTime(member.lastUpdated))
                ),
                
                React.createElement('div', { className: 'flex items-center gap-3 mt-1' },
                  React.createElement('span', null, workStatus.emoji),
                  React.createElement('span', null, statusOptions.mental[member.mentalStatus].emoji),
                  React.createElement('span', null, statusOptions.health[member.healthStatus].emoji)
                )
              );
            })
          )
        ),

        React.createElement('select', {
          value: currentUser,
          onChange: (e) => setCurrentUser(e.target.value),
          className: 'w-full mt-3 px-2 py-1 border rounded text-xs bg-gray-100'
        }, ...defaultUsers.map(name =>
          React.createElement('option', { key: name, value: name }, name)
        ))
      )
    )
  );
};

// アプリをレンダリング
ReactDOM.render(React.createElement(TeamStatusApp), document.getElementById('root'));
