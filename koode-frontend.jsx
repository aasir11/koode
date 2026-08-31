import React, { useState, useEffect } from 'react';

const BACKEND_URL = 'http://localhost:5000/api';

// ==================== MAIN APP ====================
export default function KoodeApp() {
  const [currentUser, setCurrentUser] = useState(null);
  const [page, setPage] = useState('login');
  
  const handleLogout = () => {
    setCurrentUser(null);
    setPage('login');
  };

  if (!currentUser) {
    return <LoginPage onLogin={setCurrentUser} setPage={setPage} />;
  }

  return (
    <div style={styles.app}>
      <Header user={currentUser} onLogout={handleLogout} />
      <nav style={styles.nav}>
        <NavButton 
          active={page === 'browse'} 
          onClick={() => setPage('browse')}
        >
          Browse Jobs
        </NavButton>
        {currentUser.userType === 'seeker' && (
          <>
            <NavButton 
              active={page === 'recommendations'} 
              onClick={() => setPage('recommendations')}
            >
              AI Recommendations
            </NavButton>
            <NavButton 
              active={page === 'profile'} 
              onClick={() => setPage('profile')}
            >
              My Profile
            </NavButton>
          </>
        )}
        {currentUser.userType === 'employer' && (
          <NavButton 
            active={page === 'post-job'} 
            onClick={() => setPage('post-job')}
          >
            Post Job
          </NavButton>
        )}
        <NavButton 
          active={page === 'messages'} 
          onClick={() => setPage('messages')}
        >
          Messages
        </NavButton>
      </nav>

      <main style={styles.main}>
        {page === 'browse' && <BrowseJobs userId={currentUser.id} />}
        {page === 'recommendations' && <Recommendations userId={currentUser.id} />}
        {page === 'profile' && <SeekerProfile userId={currentUser.id} />}
        {page === 'post-job' && <PostJob employerId={currentUser.id} />}
        {page === 'messages' && <Messages userId={currentUser.id} />}
      </main>
    </div>
  );
}

// ==================== LOGIN ====================
function LoginPage({ onLogin, setPage }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [userType, setUserType] = useState('seeker');
  const [isRegister, setIsRegister] = useState(false);
  const [skills, setSkills] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const endpoint = isRegister ? '/auth/register' : '/auth/login';
    const payload = isRegister 
      ? { email, name, userType, skills: skills.split(',').map(s => s.trim()) }
      : { email };

    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (data.success) {
      onLogin({ id: data.userId, email, name, userType });
      setPage('browse');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.logo}>KOODE</h1>
        <p style={styles.tagline}>Where Needs Meet People</p>
        <p style={{
          textAlign: 'center',
          fontSize: '16px',
          fontStyle: 'italic',
          color: '#2d7c4c',
          marginBottom: '36px',
          fontWeight: '500',
          lineHeight: '1.8',
          letterSpacing: '0.3px',
        }}>
          One opportunity can change a life.
        </p>
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              style={styles.input}
            />
          </div>

          {isRegister && (
            <>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>I am a</label>
                <select value={userType} onChange={(e) => setUserType(e.target.value)} style={styles.input}>
                  <option value="seeker">Job Seeker</option>
                  <option value="employer">Employer</option>
                </select>
              </div>

              {userType === 'seeker' && (
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Skills (comma separated)</label>
                  <input
                    type="text"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder="JavaScript, React, NodeJS"
                    style={styles.input}
                  />
                </div>
              )}
            </>
          )}

          <button type="submit" style={styles.button}>
            {isRegister ? 'Create Account' : 'Login'}
          </button>
        </form>

        <p style={styles.toggle}>
          {isRegister ? 'Already have an account? ' : "Don't have an account? "}
          <a href="#" onClick={() => setIsRegister(!isRegister)} style={styles.link}>
            {isRegister ? 'Login' : 'Register'}
          </a>
        </p>
      </div>
    </div>
  );
}

// ==================== BROWSE JOBS ====================
function BrowseJobs({ userId }) {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch(`${BACKEND_URL}/jobs`)
      .then(r => r.json())
      .then(setJobs);
  }, []);

  const handleContact = async () => {
    if (!message.trim()) return;
    
    await fetch(`${BACKEND_URL}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        senderId: userId,
        receiverId: selectedJob.employerId,
        jobId: selectedJob.id,
        message,
      }),
    });

    alert('Message sent to employer!');
    setMessage('');
    setSelectedJob(null);
  };

  return (
    <div style={styles.section}>
      <h2 style={styles.sectionTitle}>Available Jobs</h2>
      <p style={{...styles.subtitle, fontSize: '16px', fontStyle: 'italic', color: '#2d7c4c', marginBottom: '28px'}}>
        One opportunity can change a life. Find yours below.
      </p>
      
      <div style={styles.grid}>
        {jobs.map(job => (
          <div key={job.id} style={styles.jobCard} onClick={() => setSelectedJob(job)}>
            <h3>{job.title}</h3>
            <p><strong>{job.location}</strong></p>
            <p>{job.salary}</p>
            <p style={styles.description}>{job.description.substring(0, 100)}...</p>
            <div style={styles.skills}>
              {job.requirements?.map(req => (
                <span key={req} style={styles.skill}>{req}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {jobs.length === 0 && (
        <div style={{...styles.card, textAlign: 'center', padding: '60px 40px'}}>
          <p style={{fontSize: '18px', fontWeight: '500', color: '#2d7c4c', marginBottom: '12px'}}>No jobs posted yet.</p>
          <p style={{fontSize: '15px', color: '#666', lineHeight: '1.6'}}>
            Check back soon. When opportunities arrive, one of them could change a life—yours.
          </p>
        </div>
      )}

      {selectedJob && (
        <Modal title={selectedJob.title} onClose={() => setSelectedJob(null)}>
          <h3>{selectedJob.title}</h3>
          <p><strong>Location:</strong> {selectedJob.location}</p>
          <p><strong>Salary:</strong> {selectedJob.salary}</p>
          <p style={{marginTop: '16px', padding: '14px', background: '#e8f5e9', borderRadius: '6px', fontSize: '14px', color: '#2d7c4c', fontWeight: '500', textAlign: 'center'}}>
            🌟 One opportunity can change a life. This could be yours.
          </p>
          <p><strong>Description:</strong> {selectedJob.description}</p>
          <p><strong>Requirements:</strong> {selectedJob.requirements?.join(', ')}</p>
          
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Send a message to the employer..."
            style={styles.textarea}
          />
          <button onClick={handleContact} style={styles.button}>Send Message</button>
        </Modal>
      )}
    </div>
  );
}

// ==================== AI RECOMMENDATIONS ====================
function Recommendations({ userId }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchRecommendations = async () => {
    setLoading(true);
    const response = await fetch(`${BACKEND_URL}/ai/recommend-jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ seekerId: userId }),
    });

    const data = await response.json();
    setRecommendations(data.recommendations || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchRecommendations();
  }, [userId]);

  return (
    <div style={styles.section}>
      <h2 style={styles.sectionTitle}>AI-Recommended Jobs</h2>
      <p style={{...styles.subtitle, fontSize: '16px', fontStyle: 'italic', color: '#2d7c4c', marginBottom: '28px'}}>
        Personalized matches crafted just for you. One opportunity can change a life.
      </p>
      
      <button onClick={fetchRecommendations} disabled={loading} style={styles.button}>
        {loading ? 'Analyzing...' : 'Refresh Recommendations'}
      </button>

      <div style={styles.grid}>
        {recommendations.map(rec => (
          <div key={rec.jobId} style={{...styles.jobCard, borderLeft: `4px solid #2d7c4c`}}>
            <div style={styles.matchBadge}>{rec.matchScore}% Match</div>
            <p><strong>Job ID:</strong> {rec.jobId}</p>
            <p><strong>Why:</strong> {rec.reason}</p>
          </div>
        ))}
      </div>

      {recommendations.length === 0 && !loading && (
        <div style={{...styles.card, textAlign: 'center', padding: '40px'}}>
          <p style={{fontSize: '15px', color: '#666', marginBottom: '12px'}}>No perfect matches yet, but that's just the beginning.</p>
          <p style={{fontSize: '16px', fontStyle: 'italic', color: '#2d7c4c', fontWeight: '500'}}>Update your profile—your opportunity is waiting. One opportunity can change a life.</p>
        </div>
      )}
    </div>
  );
}

// ==================== SEEKER PROFILE ====================
function SeekerProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [experience, setExperience] = useState('');
  const [skills, setSkills] = useState('');
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    fetch(`${BACKEND_URL}/users/${userId}`)
      .then(r => r.json())
      .then(data => {
        setUser(data);
        setSkills(data.skills?.join(', ') || '');
        setExperience(data.experience || '');
      });
  }, [userId]);

  const handleSave = async () => {
    await fetch(`${BACKEND_URL}/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        experience,
        skills: skills.split(',').map(s => s.trim()),
      }),
    });
    setEditing(false);
    alert('Profile updated!');
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div style={styles.section}>
      <h2 style={styles.sectionTitle}>My Profile</h2>
      <p style={{...styles.subtitle, fontSize: '14px', fontStyle: 'italic', color: '#2d7c4c', marginBottom: '28px'}}>
        Complete your profile to unlock opportunities that match your potential.
      </p>
      
      {!editing ? (
        <div style={styles.card}>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Skills:</strong> {user.skills?.join(', ') || 'Not set'}</p>
          <p><strong>Experience:</strong> {user.experience || 'Not set'}</p>
          <button onClick={() => setEditing(true)} style={styles.button}>Edit</button>
        </div>
      ) : (
        <div style={styles.card}>
          <div style={styles.formGroup}>
            <label>Skills (comma separated)</label>
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              style={styles.input}
            />
          </div>
          <div style={styles.formGroup}>
            <label>Experience</label>
            <textarea
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              placeholder="Describe your work experience..."
              style={styles.textarea}
            />
          </div>
          <div>
            <button onClick={handleSave} style={styles.button}>Save</button>
            <button onClick={() => setEditing(false)} style={{...styles.button, background: '#999'}}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== POST JOB ====================
function PostJob({ employerId }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [salary, setSalary] = useState('');
  const [requirements, setRequirements] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    await fetch(`${BACKEND_URL}/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        employerId,
        title,
        description,
        location,
        salary,
        requirements: requirements.split(',').map(r => r.trim()),
      }),
    });

    alert('Job posted successfully!');
    setTitle('');
    setDescription('');
    setLocation('');
    setSalary('');
    setRequirements('');
  };

  return (
    <div style={styles.section}>
      <h2 style={styles.sectionTitle}>Post a New Job</h2>
      <p style={{...styles.subtitle, fontSize: '16px', fontStyle: 'italic', color: '#2d7c4c', marginBottom: '28px'}}>
        One opportunity can change a life. Share yours and make an impact.
      </p>
      
      <form onSubmit={handleSubmit} style={styles.card}>
        <div style={styles.formGroup}>
          <label>Job Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Senior React Developer"
            required
            style={styles.input}
          />
        </div>

        <div style={styles.formGroup}>
          <label>Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g., Remote, Mumbai"
            required
            style={styles.input}
          />
        </div>

        <div style={styles.formGroup}>
          <label>Salary Range</label>
          <input
            type="text"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            placeholder="e.g., ₹50,000 - ₹80,000"
            required
            style={styles.input}
          />
        </div>

        <div style={styles.formGroup}>
          <label>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Job description and responsibilities..."
            required
            style={styles.textarea}
          />
        </div>

        <div style={styles.formGroup}>
          <label>Requirements (comma separated)</label>
          <input
            type="text"
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            placeholder="e.g., React, NodeJS, MongoDB"
            required
            style={styles.input}
          />
        </div>

        <button type="submit" style={styles.button}>Post Job</button>
      </form>
    </div>
  );
}

// ==================== MESSAGES ====================
function Messages({ userId }) {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    fetch(`${BACKEND_URL}/messages/${userId}`)
      .then(r => r.json())
      .then(setMessages);
  }, [userId]);

  return (
    <div style={styles.section}>
      <h2 style={styles.sectionTitle}>Messages</h2>
      <p style={styles.subtitle}>{messages.length} {messages.length === 1 ? 'message' : 'messages'}</p>
      
      <div>
        {messages.map(msg => (
          <div key={msg.id} style={styles.messageBox}>
            <p style={styles.messageSender}>User {msg.senderId} • {new Date(msg.createdAt).toLocaleDateString()}</p>
            <p style={styles.messageText}>{msg.message}</p>
            <p style={styles.small}>Job ID: {msg.jobId}</p>
          </div>
        ))}
      </div>

      {messages.length === 0 && (
        <div style={{...styles.card, textAlign: 'center', padding: '40px'}}>
          <p style={{fontSize: '15px', color: '#666', marginBottom: '12px'}}>No conversations yet.</p>
          <p style={{fontSize: '14px', fontStyle: 'italic', color: '#2d7c4c'}}>When connections are made, opportunities arise. One opportunity can change a life.</p>
        </div>
      )}
    </div>
  );
}

// ==================== COMPONENTS ====================
function Header({ user, onLogout }) {
  return (
    <header style={styles.header}>
      <div>
        <h1 style={styles.headerTitle}>KOODE</h1>
        <p style={{...styles.headerSubtitle, marginBottom: '4px'}}>Where needs meet people</p>
        <p style={{fontSize: '12px', fontStyle: 'italic', color: 'rgba(255,255,255,0.85)', margin: 0, fontWeight: '500'}}>
          One opportunity can change a life.
        </p>
      </div>
      <div style={styles.headerRight}>
        <span>{user.name} • {user.userType === 'employer' ? 'Employer' : 'Job Seeker'}</span>
        <button onClick={onLogout} style={styles.logoutBtn}>Logout</button>
      </div>
    </header>
  );
}

function NavButton({ active, onClick, children }) {
  return (
    <button 
      onClick={onClick}
      style={{
        ...styles.navButton,
        background: active ? '#2d7c4c' : '#f0ebe3',
        color: active ? 'white' : '#3a3a3a',
        boxShadow: active ? '0 4px 12px rgba(45, 124, 76, 0.15)' : 'none',
      }}
    >
      {children}
    </button>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>{title}</h2>
          <button onClick={onClose} style={styles.closeBtn} title="Close">✕</button>
        </div>
        <div style={styles.modalBody}>{children}</div>
      </div>
    </div>
  );
}

// ==================== STYLES ====================
const styles = {
  app: {
    minHeight: '100vh',
    background: '#f9f7f4',
    fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
  },
  header: {
    background: 'linear-gradient(135deg, #2d7c4c 0%, #1f5438 100%)',
    color: 'white',
    padding: '24px 40px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 4px 12px rgba(45, 124, 76, 0.15)',
  },
  headerTitle: {
    fontSize: '32px',
    margin: 0,
    fontWeight: '600',
    letterSpacing: '-0.5px',
  },
  headerSubtitle: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.8)',
    marginTop: '2px',
    fontWeight: '400',
  },
  headerRight: {
    display: 'flex',
    gap: '20px',
    alignItems: 'center',
    fontSize: '14px',
  },
  logoutBtn: {
    background: 'rgba(255,255,255,0.15)',
    border: '1px solid rgba(255,255,255,0.3)',
    color: 'white',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s',
  },
  nav: {
    background: 'white',
    padding: '20px 40px',
    display: 'flex',
    gap: '12px',
    borderBottom: '1px solid #e8e3db',
    flexWrap: 'wrap',
    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
  },
  navButton: {
    padding: '10px 22px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.25s ease',
    background: '#f0ebe3',
    color: '#3a3a3a',
  },
  main: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px 20px',
  },
  section: {
    marginBottom: '40px',
  },
  sectionTitle: {
    fontSize: '28px',
    color: '#2d7c4c',
    marginBottom: '8px',
    fontWeight: '600',
  },
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #2d7c4c 0%, #1f5438 100%)',
    padding: '20px',
  },
  card: {
    background: 'white',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 8px 24px rgba(45, 124, 76, 0.12)',
    maxWidth: '420px',
    width: '100%',
  },
  logo: {
    fontSize: '42px',
    color: '#2d7c4c',
    margin: '0 0 12px 0',
    textAlign: 'center',
    fontWeight: '700',
    letterSpacing: '-1px',
  },
  tagline: {
    textAlign: 'center',
    color: '#888',
    marginBottom: '32px',
    fontSize: '15px',
    fontWeight: '400',
    lineHeight: '1.6',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  formLabel: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#3a3a3a',
  },
  input: {
    padding: '12px 14px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px',
    fontFamily: 'inherit',
    transition: 'all 0.2s',
  },
  textarea: {
    padding: '12px 14px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px',
    minHeight: '120px',
    fontFamily: 'inherit',
    resize: 'vertical',
    transition: 'all 0.2s',
  },
  button: {
    padding: '13px 24px',
    background: 'linear-gradient(135deg, #2d7c4c 0%, #1f5438 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '600',
    transition: 'all 0.25s ease',
    boxShadow: '0 4px 12px rgba(45, 124, 76, 0.2)',
  },
  buttonSecondary: {
    background: '#e8e3db',
    color: '#3a3a3a',
    boxShadow: 'none',
  },
  toggle: {
    textAlign: 'center',
    marginTop: '24px',
    fontSize: '14px',
    color: '#666',
  },
  link: {
    color: '#2d7c4c',
    textDecoration: 'none',
    fontWeight: '600',
    cursor: 'pointer',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '24px',
    marginTop: '24px',
  },
  jobCard: {
    background: 'white',
    padding: '24px',
    borderRadius: '10px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    border: '1px solid #f0ebe3',
    borderLeft: '4px solid #2d7c4c',
  },
  jobCardHover: {
    boxShadow: '0 8px 20px rgba(45, 124, 76, 0.12)',
    transform: 'translateY(-2px)',
  },
  jobTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#2d7c4c',
    marginBottom: '10px',
  },
  jobMeta: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '8px',
  },
  description: {
    color: '#777',
    fontSize: '14px',
    margin: '12px 0',
    lineHeight: '1.5',
  },
  skills: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    marginTop: '14px',
  },
  skill: {
    display: 'inline-block',
    background: '#e8f5e9',
    color: '#2d7c4c',
    padding: '5px 12px',
    borderRadius: '14px',
    fontSize: '12px',
    fontWeight: '500',
  },
  matchBadge: {
    display: 'inline-block',
    background: 'linear-gradient(135deg, #2d7c4c 0%, #1f5438 100%)',
    color: 'white',
    padding: '8px 14px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    marginBottom: '12px',
  },
  empty: {
    textAlign: 'center',
    color: '#bbb',
    padding: '60px 20px',
    fontSize: '15px',
  },
  subtitle: {
    color: '#888',
    fontSize: '15px',
    marginBottom: '24px',
    fontWeight: '400',
  },
  messageBox: {
    background: 'white',
    padding: '18px',
    borderRadius: '8px',
    marginBottom: '16px',
    borderLeft: '4px solid #2d7c4c',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  },
  messageSender: {
    fontWeight: '600',
    color: '#2d7c4c',
    fontSize: '14px',
    marginBottom: '8px',
  },
  messageText: {
    color: '#3a3a3a',
    fontSize: '14px',
    lineHeight: '1.6',
  },
  small: {
    fontSize: '12px',
    color: '#aaa',
    marginTop: '10px',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.45)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    background: 'white',
    borderRadius: '12px',
    maxWidth: '520px',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
    width: '90%',
  },
  modalHeader: {
    padding: '24px 28px',
    borderBottom: '1px solid #f0ebe3',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#2d7c4c',
    margin: 0,
  },
  modalBody: {
    padding: '28px',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#aaa',
    transition: 'color 0.2s',
  },
};
