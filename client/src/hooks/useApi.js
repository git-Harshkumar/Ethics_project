import { useState, useEffect, useCallback } from 'react';

export function useApplicants() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/applicants')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load applicants');
        return res.json();
      })
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}

export function useAudit(cutoffs) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cutoffs)
      });
      if (!res.ok) throw new Error('Audit failed');
      const result = await res.json();
      setData(result);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [cutoffs]);

  useEffect(() => {
    run();
  }, [run]);

  return { data, loading, error, run };
}

export function useCompare() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/compare', { method: 'POST' })
      .then(res => {
        if (!res.ok) throw new Error('Compare failed');
        return res.json();
      })
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}

export function useExplain(id, cutoffs) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    fetch(`/api/explain/${id}?alpha=${cutoffs.alpha}&beta=${cutoffs.beta}`)
      .then(res => {
        if (!res.ok) throw new Error('Explain failed');
        return res.json();
      })
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [id, cutoffs]);

  return { data, loading, error };
}

export function useAuditLog() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/audit-log')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load audit log');
        return res.json();
      })
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}

export function useRuleMap() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch('/api/rule-map')
      .then(res => res.json())
      .then(setData)
      .catch(() => setData([]));
  }, []);

  return { data };
}